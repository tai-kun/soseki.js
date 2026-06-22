import * as React from "react";

import RoutePath, { type ReadonlyRoutePath } from "../core/route-path.js";
import useRouterContext from "./use-router-context.js";

export default function useRoutePath(): ReadonlyRoutePath {
  const url = useRouterContext((router) => router.currentEntry.url);
  const path = React.useMemo(() => new RoutePath(url), [url]);

  return path;
}
