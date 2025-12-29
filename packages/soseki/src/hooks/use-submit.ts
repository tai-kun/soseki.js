import * as React from "react";
import type { ReadonlyFormData } from "../core/readonly-form-data.types.js";
import type { ReadonlyURLSearchParams } from "../core/readonly-url.types.js";
import type { IAction } from "../core/route.types.js";
import useRouteContext from "./_use-route-context.js";
import useRouterContext from "./_use-router-context.js";

/**
 * GET メソッドによる送信時のオプションです。
 */
export type SubmitGetOptions = {
  /**
   * 送信先のパスです。
   */
  readonly action?: string | undefined;

  /**
   * 現在の履歴エントリーを置き換えるかどうかを指定します。
   */
  readonly replace?: boolean | undefined;
};

/**
 * POST メソッドによる送信時のオプションです。
 */
export type SubmitPostOptions = {
  /**
   * 送信先のパスです。
   */
  readonly action?: string | undefined;

  /**
   * 実行するアクションの定義です。
   */
  readonly actionId?: IAction | undefined;
};

/**
 * 送信処理に使用するオプションの連合型です。
 */
export type SubmitOptions = SubmitGetOptions | SubmitPostOptions;

/**
 * データを送信するための関数インターフェースです。
 */
export interface ISubmit {
  /**
   * フォーム データを送信します。
   *
   * @param target 送信対象のフォームデータです。
   * @param options 送信時のオプションです。
   */
  (target: ReadonlyFormData, options?: SubmitPostOptions | undefined): void;

  /**
   * URL クエリー パラメーターを送信します。
   *
   * @param target 送信対象の URL クエリーパラメーターです。
   * @param options 送信時のオプションです。
   */
  (target: ReadonlyURLSearchParams, options?: SubmitGetOptions | undefined): void;

  /**
   * フォーム データまたは URL クエリーパラメーターを送信します。
   *
   * @param target 送信対象のデータです。
   * @param options 送信時のオプションです。
   */
  (target: ReadonlyURLSearchParams | ReadonlyFormData, options?: SubmitOptions | undefined): void;
}

/**
 * 命令的にデータを送信するための submit 関数を提供するフックです。
 *
 * @returns データを送信するための ISubmit 関数を返します。
 */
export default function useSubmit(): ISubmit {
  const { urlPath } = useRouteContext();
  const call = useRouterContext(router => router.submit);
  return React.useCallback(
    function submit(target, options = {}) {
      if (target instanceof FormData) {
        const {
          action = urlPath,
          actionId,
        } = options as SubmitPostOptions;
        return call({
          target,
          action,
          actionId,
        });
      } else {
        const {
          action = urlPath,
          replace,
        } = options as SubmitGetOptions;
        return call({
          target: target as URLSearchParams,
          action,
          history: replace
            ? "replace"
            : "push",
        });
      }
    },
    [
      call,
      urlPath,
    ],
  );
}
