import type DeferredPromise from "../core/deferred-promise.js";
import type RedirectResponse from "../core/redirect-response.js";
import type { IAction } from "../core/route.types.js";
import useRouterContext from "./_use-router-context.js";

/**
 * アクションの実行結果を推論するためのユーティリティー型です。
 *
 * 結果が `RedirectResponse` の場合は `undefined` を返し、それ以外の場合はそのままの型を返します。
 *
 * @template TResult 推論対象となる型です。
 */
// dprint-ignore
type $InferResult<TResult> = TResult extends RedirectResponse
  ? undefined
  : TResult;

/**
 * 特定のアクションに関連付けられたデータ（実行結果）をルーターのストアから取得するカスタムフックです。
 *
 * 現在の履歴エントリーに対応するアクションデータを返します。
 *
 * @template TAction 対象となるアクションの型です。
 * @param action データを取得したいアクションの定義です。
 * @returns アクションの実行結果を含む `DeferredPromise` を返します。データが存在しない場合は `undefined` を返します。
 */
export default function useActionData<TAction extends IAction>(
  action: TAction,
): DeferredPromise<$InferResult<Awaited<ReturnType<TAction>>>> | undefined {
  return useRouterContext((router): DeferredPromise<any> | undefined => {
    const {
      currentEntry,
      actionDataStore,
    } = router;
    return actionDataStore.get(currentEntry.id)?.get(action);
  });
}
