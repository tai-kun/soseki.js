import type { NinjaPromise } from "ninja-promise";

import { LoaderDataNotFoundError } from "../core/errors.js";
import useRouteContext from "./use-route-context.js";
import useRouterContext from "./use-router-context.js";

/**
 * 現在の階層のルートに紐づくローダー関数の実行結果を購読・取得するためのカスタムフックです。
 *
 * @template TData ローダー関数そのものの型、またはローダーが返すことが期待されるデータ構造の型定義です。関数型が渡された場合は、自動的にその非同期戻り値の型（非同期の解凍結果）が推論されます。
 * @returns ローダーの実行状態を管理している `NinjaPromise` を返します。
 */
export default function useLoaderData<TData = unknown>(): NinjaPromise<
  Awaited<TData extends (...args: any) => infer TReturn ? TReturn : TData>
> {
  const { loader } = useRouteContext();
  const loaderData = useRouterContext((router) => {
    const { currentEntry, loaderDataStore } = router;
    return loaderDataStore.get(currentEntry.id)?.get(loader!);
  });
  if (!loaderData) {
    throw new LoaderDataNotFoundError({ loader });
  }

  return loaderData satisfies NinjaPromise<unknown> as NinjaPromise<any>;
}
