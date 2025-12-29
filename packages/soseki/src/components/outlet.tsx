import * as React from "react";
import RouteContext from "../contexts/route-context.js";
import { RouteContextMissingError } from "../core/errors.js";

/**
 * 現在のルート階層における子ルート（アウトレット）を描画するためのコンポーネントです。
 *
 * ネストされたルーティングにおいて、親ルートのコンポーネント内で子ルートの挿入位置を指定するために使用します。
 */
export default function Outlet(): React.ReactElement | null {
  const routeContext = React.use(RouteContext);
  if (!routeContext) {
    throw new RouteContextMissingError();
  }

  return routeContext.outlet;
}
