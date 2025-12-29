import { afterEach, describe, test } from "vitest";
import singleton from "../../src/core/_singleton.js";

afterEach(() => {
  // テスト後にキャッシュをクリーンアップする。
  globalThis.soseki__singleton = undefined;
});

describe("同期関数の場合", () => {
  test("初回呼び出しのとき、ファクトリー関数の戻り値を返す", ({ expect }) => {
    // Arrange
    const key = "test-key";
    const expectedValue = { id: 1 };

    // Act
    const result = singleton(key, () => expectedValue);

    // Assert
    expect(result).toBe(expectedValue);
  });

  test("同じキーで複数回呼び出したとき、常に最初に生成されたインスタンスを返す", ({ expect }) => {
    // Arrange
    const key = "stable-key";
    let callCount = 0;
    const factory = () => {
      callCount++;
      return { count: callCount };
    };

    // Act
    const firstResult = singleton(key, factory);
    const secondResult = singleton(key, factory);

    // Assert
    expect(secondResult).toBe(firstResult);
    expect(callCount).toBe(1);
  });

  test("異なるキーで呼び出したとき、それぞれ個別のインスタンスを返す", ({ expect }) => {
    // Arrange
    const keyA = "key-a";
    const keyB = "key-b";

    // Act
    const resultA = singleton(keyA, () => ({ name: "A" }));
    const resultB = singleton(keyB, () => ({ name: "B" }));

    // Assert
    expect(resultA).not.toBe(resultB);
  });
});

describe("非同期関数の場合", () => {
  test("初回呼び出しのとき、解決された値を返す Promise を返す", async ({ expect }) => {
    // Arrange
    const key = "async-key";
    const expectedValue = "resolved-value";

    // Act
    const resultPromise = singleton(key, async () => expectedValue);
    const result = await resultPromise;

    // Assert
    expect(result).toBe(expectedValue);
  });

  test("解決待ちの間に再度呼び出されたとき、同一の Promise インスタンスを返す", ({ expect }) => {
    // Arrange
    const key = "pending-key";
    const factory = async () => "value";

    // Act
    const firstPromise = singleton(key, factory);
    const secondPromise = singleton(key, factory);

    // Assert
    expect(firstPromise).toBe(secondPromise);
  });

  test("Promise が拒絶されたとき、次に呼び出された際にファクトリー関数を再実行する", async ({ expect }) => {
    // Arrange
    const key = "error-key";
    let callCount = 0;
    const factory = async () => {
      callCount++;
      if (callCount === 1) {
        throw new Error("初回失敗");
      }
      return "成功";
    };

    // Act & Assert
    // 1 回目の呼び出し：エラーになることを確認する。
    await expect(singleton(key, factory)).rejects.toThrow("初回失敗");

    // 2 回目の呼び出し：キャッシュが削除されており、再試行されることを確認する。
    const secondResult = await singleton(key, factory);
    expect(secondResult).toBe("成功");
    expect(callCount).toBe(2);
  });
});
