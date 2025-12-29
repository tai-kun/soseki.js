import * as React from "react";

/**
 * 初期化が一度だけ実行されることを保証するための特殊なシンボルです。`ref.current` の初期値として使用され、値がまだ設定されていない状態を示します。
 */
const NONE = Symbol.for("soseki/none");

/**
 * コンポーネントのライフサイクルを通じて、初期化関数 (`fn`) を一度だけ実行し、その結果を保持し続けるカスタムフックです。
 *
 * `useMemo` と異なり、依存配列が存在しないため、再レンダリングやフックの呼び出し順序に関係なく、最初のレンダリング時にのみ初期化が実行されることを保証します。
 *
 * @template T 初期化関数が返す値の型です。
 * @param fn 一度だけ実行される初期化関数です。引数は取りません。
 * @returns 初期化関数が返した、シングルトンとして保持される値です。
 */
export default function useSingleton<T>(fn: () => T): T {
  const ref = React.useRef<T | typeof NONE>(NONE);
  if (ref.current === NONE) {
    ref.current = fn();
  }

  return ref.current;
}
