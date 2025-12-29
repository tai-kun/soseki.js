import { describe, test } from "vitest";
import DeferredPromise from "../../src/core/deferred-promise.js";

describe("インスタンス化と基本状態", () => {
  test("新規作成されたとき、ステータスは pending になる", ({ expect }) => {
    // Arrange & Act
    const { promise } = DeferredPromise.withResolvers<string>();

    // Assert
    expect(promise.status).toBe("pending");
  });
});

describe("resolve による解決", () => {
  test("値を指定して resolve すると、ステータスが fulfilled になり、その値が保持される", ({ expect }) => {
    // Arrange
    const { promise, resolve } = DeferredPromise.withResolvers<string>();
    const expectedValue = "成功";

    // Act
    resolve(expectedValue);

    // Assert
    expect(promise.status).toBe("fulfilled");
    if (promise.status === "fulfilled") {
      expect(promise.value).toBe(expectedValue);
    }
  });

  test("PromiseLike な値を resolve すると、その Promise の解決を待ってから自身のステータスを更新する", async ({ expect }) => {
    // Arrange
    const { promise, resolve } = DeferredPromise.withResolvers<string>();
    const innerPromise = Promise.resolve("内部解決");

    // Act
    resolve(innerPromise);

    // Assert
    // resolve 直後は pending（マイクロタスクで処理されるため）
    expect(promise.status).toBe("pending");

    // Promise の解決を待機
    await innerPromise;
    // 内部の then が呼ばれるのを待つために少し待機
    await new Promise((r) => setTimeout(r, 0));

    expect(promise.status).toBe("fulfilled");
    if (promise.status === "fulfilled") {
      expect(promise.value).toBe("内部解決");
    }
  });
});

describe("reject による拒否", () => {
  test("理由を指定して reject すると、ステータスが rejected になり、その理由が保持される", ({ expect }) => {
    // Arrange
    const { promise, reject } = DeferredPromise.withResolvers<string>();
    const reason = new Error("失敗");

    // Act
    reject(reason);

    // Assert
    expect(promise.status).toBe("rejected");
    if (promise.status === "rejected") {
      expect(promise.reason).toBe(reason);
    }
  });
});

describe("静的メソッド", () => {
  test("DeferredPromise.resolve を使用したとき、即座に解決状態のインスタンスが生成される", ({ expect }) => {
    // Arrange & Act
    const value = 100;
    const promise = DeferredPromise.resolve(value);

    // Assert
    expect(promise.status).toBe("fulfilled");
    expect(promise.value).toBe(value);
  });

  test("DeferredPromise.reject を使用したとき、即座に拒否状態のインスタンスが生成される", ({ expect }) => {
    // Arrange & Act
    const reason = "error";
    const promise = DeferredPromise.reject(reason);

    // Assert
    expect(promise.status).toBe("rejected");
    expect(promise.reason).toBe(reason);
  });

  test("DeferredPromise.try で同期関数を実行したとき、その戻り値で解決される", ({ expect }) => {
    // Arrange & Act
    const promise = DeferredPromise.try(() => "sync result");

    // Assert
    expect(promise.status).toBe("fulfilled");
    if (promise.status === "fulfilled") {
      expect(promise.value).toBe("sync result");
    }
  });

  test("DeferredPromise.try で例外が発生したとき、その例外を理由として拒否される", ({ expect }) => {
    // Arrange & Act
    const error = new Error("throw error");
    const promise = DeferredPromise.try(() => {
      throw error;
    });

    // Assert
    expect(promise.status).toBe("rejected");
    if (promise.status === "rejected") {
      expect(promise.reason).toBe(error);
    }
  });
});

describe("メソッドチェーン (then)", () => {
  test("解決後に then で登録されたコールバックが実行され、新しい値で解決される", async ({ expect }) => {
    // Arrange
    const { promise, resolve } = DeferredPromise.withResolvers<number>();
    const results: number[] = [];

    // Act
    promise.then((val) => {
      const next = val * 2;
      results.push(next);
      return next;
    });
    resolve(10);

    // Assert
    // 非同期実行を待機
    await new Promise<void>((r) => queueMicrotask(r));

    expect(results.length).toBe(1);
    expect(results[0]!).toBe(20);
  });

  test("拒否後に then の第二引数（onRejected）が実行され、その戻り値で次の Promise が解決される", async ({ expect }) => {
    // Arrange
    const { promise, reject } = DeferredPromise.withResolvers<number>();
    const error = new Error("fail");
    let capturedReason: unknown;

    // Act
    const nextPromise = promise.then(
      null,
      (reason) => {
        capturedReason = reason;
        return "recovered";
      },
    );
    reject(error);

    // Assert
    await new Promise<void>((r) => queueMicrotask(r));

    expect(capturedReason).toBe(error);
    // エラーハンドリングされると、後続は fulfilled になる仕様
    expect(nextPromise.status).toBe("fulfilled");
    if (nextPromise.status === "fulfilled") {
      expect(nextPromise.value).toBe("recovered");
    }
  });

  test("コールバック内で例外が発生したとき、後続の Promise が拒否される", async ({ expect }) => {
    // Arrange
    const { promise, resolve } = DeferredPromise.withResolvers<string>();
    const error = new Error("callback error");

    // Act
    const nextPromise = promise.then(() => {
      throw error;
    });
    resolve("ok");

    // Assert
    await new Promise<void>((r) => queueMicrotask(r));

    expect(nextPromise.status).toBe("rejected");
    if (nextPromise.status === "rejected") {
      expect(nextPromise.reason).toBe(error);
    }
  });
});

describe("不変性", () => {
  test("一度 fulfilled になった後は、再度 resolve しても値が変化しない", ({ expect }) => {
    // Arrange
    const { promise, resolve } = DeferredPromise.withResolvers<string>();

    // Act
    resolve("first");
    resolve("second");

    // Assert
    expect(promise.status).toBe("fulfilled");
    if (promise.status === "fulfilled") {
      expect(promise.value).toBe("first");
    }
  });

  test("一度 rejected になった後は、resolve してもステータスが変化しない", ({ expect }) => {
    // Arrange
    const { promise, resolve, reject } = DeferredPromise.withResolvers<string>();

    // Act
    reject("error");
    resolve("success");

    // Assert
    expect(promise.status).toBe("rejected");
    if (promise.status === "rejected") {
      expect(promise.reason).toBe("error");
    }
  });
});
