import type { NinjaPromise } from "ninja-promise";

import type RedirectResponse from "../core/redirect-response.js";
import useRouteContext from "./use-route-context.js";
import useRouterContext from "./use-router-context.js";

/**
 * アクション関数の戻り値の型から、リダイレクト応答を除外して正規化するユーティリティー型です。
 *
 * アクションがリダイレクトを返した場合、フレームワークの内部仕様によって実際の値は `undefined` に置換されるため、型定義においてもその挙動を忠実に表現します。
 */
type ActionResult<TResult> = Awaited<TResult extends RedirectResponse ? undefined : TResult>;

/**
 * アクション関数またはデータ型から、最終的に解決されるデータの型を抽出するユーティリティー型です。
 *
 * @template TData アクション関数、または解決されるデータの型です。
 */
export type FulfilledActionData<TData = unknown> = ActionResult<
  TData extends (...args: any) => infer TReturn ? TReturn : TData
>;

/**
 * {@link useActionData|`useActionData`} カスタムフックが返すオブジェクトの型定義です。
 *
 * 非同期処理の進行状況を管理する `NinjaPromise` でラップされた、解決済みのデータ型を表します。
 *
 * @template TData アクション関数、またはアクションが返すデータの型定義です。
 */
export type ActionData<TData = unknown> = NinjaPromise<FulfilledActionData<TData>>;

/**
 * 現在の階層のルートに紐づくアクション関数の最新の実行結果を購読・取得するためのカスタムフックです。
 *
 * @template TData アクション関数そのものの型、またはアクションが返すことが期待されるデータ構造の型定義です。関数型が渡された場合は、自動的にその非同期戻り値の型が推論されます。
 * @returns アクションが実行済み、または実行中であれば結果を内包した `NinjaPromise` を返し、一度も実行されていないか対象のアクションが存在しない場合は `undefined` を返します。
 */
export default function useActionData<TData = unknown>(): ActionData<TData> | undefined {
  const { action } = useRouteContext();
  const actionData = useRouterContext((router) => {
    const { currentEntry, actionDataStore } = router;
    return actionDataStore.get(currentEntry.id)?.get(action!);
  });

  return actionData satisfies ActionData<unknown> | undefined as ActionData<any> | undefined;
}
