/**
 * 与えられた値が `PromiseLike` であるかどうかを判定します。
 *
 * @param value 判定対象の値です。
 * @returns 値が `then` メソッドを持つオブジェクトである場合は `true`、それ以外は `false` を返します。
 */
export default function isPromiseLike<T = unknown>(value: unknown): value is PromiseLike<T> {
  return (
    value !== null
    && typeof value === "object"
    // @ts-expect-error
    && typeof value["then"] === "function"
  );
}
