import { inject } from "regexparam";
import matchRoutePath from "./_match-route-path.js";
import type { PathParams, Route } from "./route.types.js";

/**
 * マッチしたルートの情報に、抽出されたパスパラメーターを統合した型定義です。
 */
export type MatchedRoute = Pick<Route, "path" | "index" | "dataFuncs" | "component"> & {
  /**
   * パス名から抽出された動的なパラメーターのオブジェクトです。
   */
  readonly params: PathParams;

  /**
   * ルートのパスパターンに基づく URL のパスです。
   *
   * @example
   * ```ts
   * const route = matchRoutes(routes, "/user/123/setting");
   * route.path;     // "/user/:id"
   * route.params;   // { id: "123" }
   * route.urlPath;  // "/user/123"
   * ```
   */
  readonly urlPath: string;
};

/**
 * 単一のルートとその子ルートに対して、再帰的にパスマッチングを試みます。
 *
 * @param route マッチングを確認する対象のルートオブジェクトです。
 * @param pathname マッチング対象のパス名です。
 * @returns マッチした場合は親から子への階層構造を保持した配列を返し、マッチしない場合は `null` を返します。
 */
function matchRoute(
  route: Route,
  pathname: string,
): readonly [MatchedRoute, ...MatchedRoute[]] | null {
  const result = matchRoutePath(route, pathname);
  if (!result) {
    return null;
  }

  const matched: MatchedRoute = {
    path: route.path,
    index: route.index,
    params: result.params,
    urlPath: inject(route.path, result.params),
    dataFuncs: route.dataFuncs,
    component: route.component,
  };

  // インデックスルート（末端）の場合は、現在のルートを配列に含めて返します。
  if (route.index) {
    return [matched];
  }

  // 子ルートの中にマッチするものがあるか探索します。
  for (const childRoute of route.children) {
    const childMathced = matchRoute(childRoute, pathname);
    if (childMathced) {
      return [
        ...childMathced,
        matched,
      ];
    }
  }

  return [matched];
}

/**
 * ルート定義のリスト全体から、指定されたパス名にマッチするルートを探索します。
 *
 * @param routes 探索対象となるルートオブジェクトの配列です。
 * @param pathname マッチング対象のパス名です。
 * @returns 最初にマッチしたルートとその階層構造を返し、どのルートにもマッチしない場合は `null` を返します。
 */
export default function matchRoutes(
  routes: readonly Route[],
  pathname: string,
): readonly [MatchedRoute, ...MatchedRoute[]] | null {
  for (const route of routes) {
    const matched = matchRoute(route, pathname);
    if (matched) {
      return matched;
    }
  }

  return null;
}
