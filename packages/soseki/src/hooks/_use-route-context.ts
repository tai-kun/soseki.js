import * as React from "react";
import RouteContext, { type RouteContextValue } from "../contexts/route-context.js";
import { RouteContextMissingError } from "../core/errors.js";

/**
 * ルートに関するコンテキスト情報を取得するためのカスタムフックです。
 *
 *  `RouteContext` から現在のコンテキスト値を抽出し、コンテキストが提供されていない場合にはエラーを投げます。
 *
 * @returns 現在のルートコンテキストの値を返します。
 */
export default function useRouteContext(): RouteContextValue {
  const routeContext = React.use(RouteContext);
  if (!routeContext) {
    throw new RouteContextMissingError();
  }

  return routeContext;
}
