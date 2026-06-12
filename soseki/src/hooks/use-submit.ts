import * as React from "react";

import type { ReadonlyFormData } from "../core/readonly-form-data.types.js";
import type { ReadonlyURLSearchParams } from "../core/readonly-url.types.js";
import useFormAction from "./use-form-action.js";
import useRouterContext from "./use-router-context.js";

/**
 * クエリーパラメーター送信（HTTP GET 相当）のサブミット処理をカスタマイズするためのオプション型です。
 */
export type SubmitGetOptions = {
  /**
   * 送信先（遷移先）のベースとなる URL パスを明示的に上書き指定します。省略時は現在のフォームアクションパスが使用されます。
   */
  readonly action?: string | undefined;

  /**
   * 履歴スタックへの追加方法を制御します。`true` の場合は現在の履歴を上書きし、`false` または省略時は新規追加します。
   */
  readonly replace?: boolean | undefined;
};

/**
 * フォームデータ送信（HTTP POST 相当）のサブミット処理をカスタマイズするためのオプション型です。
 */
export type SubmitPostOptions = {
  /**
   * 送信先（アクション実行先）の URL パスを明示的に上書き指定します。省略時は現在のフォームアクションパスが使用されます。
   */
  readonly action?: string | undefined;
};

/**
 * プログラムから命令的にデータ送信および画面遷移を実行する、`submit` 関数のオーバーロードインターフェース定義です。
 */
export interface SubmitFunction {
  /**
   * 不変のフォームデータを引き渡して、HTTP POST 相当のアクション処理をトリガーします。
   *
   * @param target 送信するフォームデータです。
   * @param options POST 送信用のオプションです。
   */
  (target: ReadonlyFormData, options?: SubmitPostOptions): void;

  /**
   * 不変のクエリーパラメーターを引き渡して、HTTP GET 相当の検索条件の更新をトリガーします。
   *
   * @param target 送信する検索クエリーです。
   * @param options GET 送信用のオプションです。
   */
  (target: ReadonlyURLSearchParams, options?: SubmitGetOptions): void;

  /**
   * 内部実装および包括的なユースケースに対応する汎用シグニチャーです。
   *
   * @param target 送信愛用です。
   * @param options オプションです。
   */
  (
    target: ReadonlyURLSearchParams | ReadonlyFormData,
    options?: SubmitGetOptions | SubmitPostOptions,
  ): void;
}

/**
 * ユーザーのクリックイベントや、特定のロジックに基づくタイミングで、プログラムから宣言的・命令的にサブミット処理（データ送信および遷移）を実行するための関数を取得するカスタムフックです。
 *
 * 渡されたペイロードが `FormData` であるか `URLSearchParams` であるかをランタイムで自動判定し、適切なルーティングエンジンメソッドへと送信されます。
 *
 * @returns 依存関係が最適化され、同一参照が保証された `submit` 関数を返します。
 */
export default function useSubmit(): SubmitFunction {
  const formAction = useFormAction();
  const routerSubmit = useRouterContext((router) => router.submit);

  // レンダリング毎に関数の参照が変わって子コンポーネントが不要に再描画されるのを防ぐため、useCallback でラップします。
  return React.useCallback(
    function submit(target, options = {}) {
      if (target instanceof FormData) {
        // 分岐 1: データ実体がフォームデータである場合 ＝ 副作用を伴うデータ変更処理（POST / Action 契機）

        const { action = formAction } = options as SubmitPostOptions;

        // エンジンに対して「FORM_DATA」タイプとしてのサブミットタスクを発行します。
        return routerSubmit({
          type: "FORM_DATA",
          target,
          action,
        });
      } else {
        // 分岐 2: データ実体がクエリーパラメーターである場合 ＝ 読み取り専用の条件更新処理（GET / Loader 契機）

        const { action = formAction, replace } = options as SubmitGetOptions;

        return routerSubmit({
          type: "URL_SEARCH_PARAMS",
          target: target as URLSearchParams,
          action,
          // replace の真偽値に基づき、ブラウザー履歴の追加方法（push / replace）を明示的にマッピングします。
          history: replace ? "replace" : "push",
        });
      }
    },
    [routerSubmit, formAction],
  );
}
