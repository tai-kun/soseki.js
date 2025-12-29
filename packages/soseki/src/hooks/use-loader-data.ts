import type DeferredPromise from "../core/deferred-promise.js";
import { LoaderDataNotFoundError } from "../core/errors.js";
import type { ILoader } from "../core/route.types.js";
import useRouterContext from "./_use-router-context.js";

/**
 * 指定されたローダーに関連付けられたデータを取得するためのカスタムフックです。
 *
 * @template TLoader 対象となるローダーの型です。
 * @param loader データを取得したいローダーの定義です。
 * @returns ローダーの実行結果を含む `DeferredPromise` を返します。
 */
export default function useLoaderData<TLoader extends ILoader>(
  loader: TLoader,
): DeferredPromise<Awaited<ReturnType<TLoader>>> {
  const loaderData = useRouterContext((router): DeferredPromise<any> | undefined => {
    const {
      currentEntry,
      loaderDataStore,
    } = router;
    return loaderDataStore.get(currentEntry.id)?.get(loader);
  });
  if (!loaderData) {
    throw new LoaderDataNotFoundError(loader);
  }

  return loaderData;
}
