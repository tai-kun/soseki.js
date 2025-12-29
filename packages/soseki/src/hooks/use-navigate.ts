import * as React from "react";
import type { NavigateTo } from "../engines/engine.types.js";
import useRouterContext from "./_use-router-context.js";

/**
 * 遷移（ナビゲート）を実行する際のオプション設定です。
 */
export type NavigateOptions = {
  /**
   * 履歴を置き換えるかどうかを指定します。
   *
   * `true` の場合は現在のエントリーを置換し、`false` または未定義の場合は新しいエントリーを追加します。
   */
  readonly replace?: boolean | undefined;
};

/**
 * 指定されたパスへ遷移するための関数インターフェースです。
 */
export interface INavigate {
  /**
   * ナビゲーションを実行します。
   *
   * @param to 遷移先です。
   * @param options 遷移時のオプション設定です。
   */
  (to: NavigateTo, options?: NavigateOptions | undefined): void;

  /**
   * ナビゲーションを実行します。
   *
   * @param delta 履歴スタックの相対位置です。
   */
  (delta: number): void;
}

/**
 * プログラムによる遷移（ナビゲート）を行うための関数を取得するカスタムフックです。
 *
 * コンポーネント内でこのフックを使用することで、ボタンのクリックイベントなどで任意のパスへ移動できるようになります。
 *
 * @returns 遷移を実行するための関数である `INavigate` を返します。
 */
export default function useNavigate(): INavigate {
  const call = useRouterContext(router => router.navigate);
  return React.useCallback(
    function navigate(...args: [NavigateTo, options?: NavigateOptions | undefined] | [number]) {
      if (typeof args[0] === "number") {
        const [delta] = args;
        return call({ delta });
      }

      const [to, options = {}] = args;
      const { replace = false } = options;
      return call({
        to,
        history: replace
          ? "replace"
          : "push",
      });
    },
    [call],
  );
}
