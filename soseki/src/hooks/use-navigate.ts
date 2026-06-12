import * as React from "react";

import type {} from "../engines/engine.types.js";
import useRouterContext from "./use-router-context.js";

/**
 * 遷移先のアドレスを指定するための表現型です。
 *
 * 完全な URL パス文字列か、またはパスの各コンポーネントを部分的にパッチするためのオブジェクトのいずれかを受け入れます。
 */
export type NavigateTo =
  | string
  | {
      /**
       * 遷移先のドメイン以下のリクエストパス（例: `"/dashboard"`）です。
       */
      readonly pathname?: string | undefined;

      /**
       * 遷移先に付与する検索クエリー文字列（例: `"?id=foo"`）です。
       */
      readonly search?: string | undefined;

      /**
       * 遷移先に付与するハッシュフラグメント（例: `"#profile"`）です。
       */
      readonly hash?: string | undefined;
    };

/**
 * 画面遷移の挙動をカスタマイズするためのオプション型です。
 */
export type NavigateOptions = {
  /**
   * 履歴スタックへの追加方法を制御します。`true` の場合は現在の履歴を上書きし、`false` または省略時は新規追加します。
   */
  readonly replace?: boolean | undefined;
};

/**
 * プログラムから命令的に画面遷移を実行する、`NavigateFunction` 関数のオーバーロードインターフェース定義です。
 */
export interface NavigateFunction {
  /**
   * 指定されたアドレスへ画面を遷移させます。
   *
   * @param to 遷移先の対象となるデータ表現です。
   * @param options 履歴のスタック方法などを制御するオプションです。
   */
  (to: NavigateTo, options?: NavigateOptions): void;

  /**
   * ブラウザーのセッション履歴スタック内を、現在地を基準に相対移動させます。
   *
   * @param delta 移動する履歴のステップ数（例: `-1` で1つ戻る、`1` で1つ進む）です。
   */
  (delta: number): void;
}

/**
 * リンクなどを介さない、ボタンのクリックハンドラーや非同期処理の完了時などから、プログラムによって命令的に画面遷移や履歴移動をトリガーするための関数を取得するカスタムフックです。
 *
 * @returns `NavigateFunction` 関数です。
 */
export default function useNavigate(): NavigateFunction {
  const routerNavigate = useRouterContext((router) => router.navigate);

  // レンダリング毎に関数の参照が変わって子コンポーネントが不要に再描画されるのを防ぐため、useCallback でラップします。
  return React.useCallback(
    function navigate(...args: [NavigateTo, options?: NavigateOptions | undefined] | [number]) {
      if (typeof args[0] === "number") {
        const [delta] = args;

        return routerNavigate({
          type: "MOVE",
          delta,
        });
      }

      const [to, options = {}] = args;
      const { replace = false } = options;
      const history = replace ? "replace" : "push";
      if (typeof to === "string") {
        return routerNavigate({
          to: {
            path: to,
            type: "PATH",
          },
          type: "LINK",
          history,
        });
      } else {
        return routerNavigate({
          to: {
            ...to,
            type: "PARTIAL",
          },
          type: "LINK",
          history,
        });
      }
    },
    [routerNavigate],
  );
}
