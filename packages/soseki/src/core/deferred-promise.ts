import isPromiseLike from "./_is-promise-like.js";

/**
 * DeferredPromise の基本型です。
 *
 * @template T 非同期処理の結果として返される値の型です。
 */
interface DeferredPromiseLike<T> {
  /**
   * Promise が解決または拒否された際のコールバックを登録します。
   *
   * @template TResult1 解決時コールバックの戻り値の型です。
   * @template TResult2 拒否時コールバックの戻り値の型です。
   * @param onfulfilled 解決時に実行されるコールバックです。
   * @param onrejected 拒否時に実行されるコールバックです。
   * @returns 新しい DeferredPromise インスタンスです。
   */
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ): DeferredPromise<TResult1 | TResult2>;
}

/**
 * 待機状態（pending）にある DeferredPromise を表すインターフェースです。
 *
 * @template T 非同期処理の結果として返される値の型です。
 */
export interface PendingDeferredPromise<T> extends DeferredPromiseLike<T> {
  /**
   * 現在の状態を示します。
   */
  status: "pending";
}

/**
 * 完了状態（fulfilled）にある DeferredPromise を表すインターフェースです。
 *
 * @template T 非同期処理の結果として返される値の型です。
 */
export interface FulfilledDeferredPromise<T> extends DeferredPromiseLike<T> {
  /**
   * 現在の状態を示します。
   */
  status: "fulfilled";

  /**
   * 解決された値です。
   */
  value: T;
}

/**
 * 拒否状態（rejected）にある DeferredPromise を表すインターフェースです。
 *
 * @template T 非同期処理の結果として期待されていた値の型です。
 */
export interface RejectedDeferredPromise<T> extends DeferredPromiseLike<T> {
  /**
   * 現在の状態を示します。
   */
  status: "rejected";

  /**
   * 拒否された理由（エラー内容）です。
   */
  reason: unknown;
}

/**
 * Promise の状態を外部から同期的に参照できるようにしたクラスです。
 *
 * PromiseLike を実装しています。このクラスは主に `React.use` で使うことを想定して実装されています。
 *
 * @template T 非同期処理の結果として返される値の型です。
 */
type DeferredPromise<T> =
  | PendingDeferredPromise<T>
  | FulfilledDeferredPromise<T>
  | RejectedDeferredPromise<T>;

/**
 * 外部から解決または拒否が可能な DeferredPromise のリゾルバー群を表すインターフェースです。
 *
 * @template T DeferredPromise が解決された際の値の型です。
 */
export interface DeferredPromiseWithResolvers<T> {
  /**
   * 現在のステータスを持つ DeferredPromise オブジェクトです。
   */
  promise: DeferredPromise<T>;

  /**
   * DeferredPromise を解決（resolve）させる関数です。
   *
   * @param value 解決に用いる値です。
   */
  resolve(value: T | PromiseLike<T>): void;

  /**
   * DeferredPromise を拒否（reject）させる関数です。
   *
   * @param reason 拒否の理由です。
   */
  reject(reason?: unknown): void;
}

/**
 * DeferredPromise が取り得る状態のユニオン型です。
 */
type DeferredPromiseState = "pending" | "fulfilled" | "rejected";

/**
 * then メソッドで登録されるコールバックと、それに関連する解決・拒否関数を保持する型です。
 *
 * @template T 元の Promise が解決された際の値の型です。
 * @template TResult コールバックの実行結果として返される値の型です。
 */
type PromiseCallback<T, TResult> = {
  /**
   * 後続の Promise を拒否するための関数です。
   */
  readonly reject: (reason?: unknown) => void;

  /**
   * 後続の Promise を解決するための関数です。
   */
  readonly resolve: (value: TResult) => void;

  /**
   * 拒否時に実行されるユーザー定義のコールバックです。
   */
  readonly onRejected:
    | ((reason: unknown) => TResult | PromiseLike<TResult>)
    | null
    | undefined;

  /**
   * 解決時に実行されるユーザー定義のコールバックです。
   */
  readonly onFulfilled:
    | ((value: T) => TResult | PromiseLike<TResult>)
    | null
    | undefined;
};

/**
 * 動的に解決された値や拒否理由を保持するためのベースクラスを生成する定数です。
 */
const Options = (class {}) as {
  new<T>(): {
    /**
     * 解決された値です。
     */
    value?: T;

    /**
     * 拒否された理由（エラー内容）です。
     */
    reason?: unknown;
  };
};

const DeferredPromise = class DeferredPromise_<T> extends Options<T> implements PromiseLike<T> {
  /**
   * 指定された関数を実行し、その結果を DeferredPromise として返します。
   * 関数が同期的に例外を投げた場合、拒否状態の Promise を返します。
   *
   * @template T 関数の戻り値の型です。
   * @template TArgs 関数に渡す引数の型配列です。
   * @param callbackFn 実行するコールバック関数です。
   * @param args 関数に渡す引数です。
   * @returns 実行結果をラップした DeferredPromise です。
   */
  public static try<T, TArgs extends unknown[]>(
    callbackFn: (...args: TArgs) => T | PromiseLike<T>,
    ...args: TArgs
  ): DeferredPromise<Awaited<T>> {
    let value;
    try {
      value = callbackFn(...args);
      if (!isPromiseLike(value)) {
        return this.resolve(value) as DeferredPromise<Awaited<T>>;
      }
    } catch (ex) {
      return this.reject<T>(ex) as DeferredPromise<Awaited<T>>;
    }

    const {
      reject,
      resolve,
      promise,
    } = this.withResolvers<Awaited<T>>();
    (async function runDeferredPromise() {
      try {
        resolve(await value);
      } catch (ex) {
        reject(ex);
      }
    })();

    return promise as DeferredPromise<Awaited<T>>;
  }

  /**
   * 既に拒否状態となっている DeferredPromise インスタンスを生成します。
   *
   * @template T DeferredPromise が期待していた値の型です。
   * @param reason 拒否の理由です。
   * @returns 拒否状態の DeferredPromise です。
   */
  public static reject<T = never>(reason?: unknown): RejectedDeferredPromise<T> {
    const promise = new DeferredPromise_<T>();
    promise.#reject(reason);

    return promise as RejectedDeferredPromise<T>;
  }

  /**
   * 既に解決状態となっている DeferredPromise インスタンスを生成します。
   *
   * @template T 解決される値の型です。
   * @param value 解決に用いる値です。
   * @returns 解決状態の DeferredPromise です。
   */
  public static resolve<T>(value: T): FulfilledDeferredPromise<T> {
    const promise = new DeferredPromise_<T>();
    promise.#resolve(value);

    return promise as FulfilledDeferredPromise<T>;
  }

  /**
   * DeferredPromise と、それを外部から制御するためのリゾルバー（resolve/reject）を生成します。
   *
   * @template T DeferredPromise が解決された際の値の型です。
   * @returns DeferredPromise とリゾルバーを含むオブジェクトです。
   */
  public static withResolvers<T>(): DeferredPromiseWithResolvers<T> {
    const promise = new DeferredPromise_<T>();

    return {
      reject(reason) {
        promise.#reject(reason);
      },
      resolve(value) {
        promise.#resolve(value);
      },
      // @ts-expect-error
      promise,
    };
  }

  /**
   * 解決または拒否を待機しているコールバックのキューです。
   */
  readonly #queue: PromiseCallback<T, any>[] = [];

  /**
   * 内部的に Promise を拒否状態に遷移させます。
   *
   * @param reason 拒否の理由です。
   */
  #reject(reason?: unknown): void {
    if (this.status !== "pending") {
      return;
    }

    this.status = "rejected";
    this.reason = reason;
    this.#processQueue();
  }

  /**
   * 内部的に Promise を解決状態に遷移させます。
   *
   * 引数が PromiseLike の場合は、その状態を継承します。
   *
   * @param value 解決に用いる値、または PromiseLike オブジェクトです。
   */
  #resolve(value: T | PromiseLike<T>): void {
    if (this.status !== "pending") {
      return;
    }

    if (!isPromiseLike(value)) {
      // 値による解決を行います。
      this.status = "fulfilled";
      this.value = value;
      this.#processQueue();
      return;
    }

    // 受け取った値が PromiseLike だった場合、その状態を継承します。
    try {
      // 再帰的に待機します。
      value.then.call(
        value,
        (y: T) => this.#resolve(y),
        (r: unknown) => this.#reject(r),
      );
    } catch (ex) {
      this.#reject(ex);
    }
  }

  /**
   * キューに積まれたコールバックを順次実行します。
   *
   * ステータスが確定していない場合は何もしません。
   */
  #processQueue(): void {
    if (this.status === "pending") {
      return;
    }

    // Promise の仕様に従い、マイクロタスクに入れて非同期実行を保証します。
    queueMicrotask(() => {
      while (this.#queue.length > 0) {
        const callback = this.#queue.shift();
        if (!callback) {
          continue;
        }

        const {
          reject,
          resolve,
          onRejected,
          onFulfilled,
        } = callback;
        try {
          if (this.status === "fulfilled") {
            if (typeof onFulfilled === "function") {
              const result = onFulfilled(this.value!);
              resolve(result);
            } else {
              // コールバックがない場合は値を透過させます。
              resolve(this.value);
            }
          } else if (this.status === "rejected") {
            if (typeof onRejected === "function") {
              const result = onRejected(this.reason);
              resolve(result); // エラーハンドリング成功時は次の Promise は resolve されます。
            } else {
              // コールバックがない場合はエラーを透過させます。
              reject(this.reason);
            }
          }
        } catch (ex) {
          // コールバック実行中にエラーが発生した場合は、後続の Promise を拒否します。
          reject(ex);
        }
      }
    });
  }

  /**
   * 現在の Promise の状態です。
   */
  public status: DeferredPromiseState = "pending";

  /**
   * Promise が解決または拒否された際のコールバックを登録します。
   *
   * @template TResult1 解決時コールバックの戻り値の型です。
   * @template TResult2 拒否時コールバックの戻り値の型です。
   * @param onfulfilled 解決時に実行されるコールバックです。
   * @param onrejected 拒否時に実行されるコールバックです。
   * @returns 新しい DeferredPromise インスタンスです。
   */
  public then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ): DeferredPromise<TResult1 | TResult2> {
    // 新しい DeferredPromise を作成してチェーンをつなぎます。
    const nextPromise = new DeferredPromise_<TResult1 | TResult2>();

    this.#queue.push({
      reject(reason) {
        nextPromise.#reject(reason);
      },
      resolve(value) {
        nextPromise.#resolve(value);
      },
      onRejected: onrejected,
      onFulfilled: onfulfilled,
    });

    // すでに解決/拒否済みかもしれないのでキュー処理を試行します。
    this.#processQueue();

    return nextPromise as DeferredPromise<TResult1 | TResult2>;
  }
};

export default DeferredPromise;
