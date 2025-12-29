import * as React from "react";
import RouterContext, { type RouterRef } from "../contexts/router-context.js";
import { RouterContextMissingError } from "../core/errors.js";

/**
 * ルーターのコンテキストから特定の状態を抽出して取得するためのカスタムフックです。
 *
 * @template TSlice 抽出される状態の型です。
 * @param selector ルーターの参照から必要なデータを抽出するためのセレクター関数です。
 * @returns セレクターによって抽出された状態を返します。
 */
export default function useRouterContext<TSlice>(
  selector: (router: RouterRef["current"]) => TSlice,
): TSlice {
  const routerContext = React.use(RouterContext);
  if (!routerContext) {
    throw new RouterContextMissingError();
  }

  const {
    routerRef,
    subscribe,
  } = routerContext;
  return React.useSyncExternalStore(subscribe, () => selector(routerRef.current));
}
