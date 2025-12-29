import { parse } from "regexparam";
import compareRoutePaths from "./_compare-route-paths.js";
import encodePathname from "./_encode-pathname.js";
import type { Route, RouteDefinition } from "./route.types.js";

/**
 * パスのプレフィックスを考慮しながら再帰的にルートを変換する内部実装です。
 *
 * @param defs 処理対象のルート定義の配列です。
 * @param prefix 親ルートから引き継いだパスのプレフィックスです。
 * @returns 変換後のルート配列です。
 */
function processRoutesImpl(routes: readonly RouteDefinition[], prefix = ""): readonly Route[] {
  return routes
    .map(route => {
      const path = encodePathname(prefix + "/" + route.path);
      const isIndex = !route.children;
      const {
        keys: paramKeys,
        pattern: pathPattern,
      } = parse(
        path,
        // インデックスルートでないとき loose オプションを `true` にして子ルートに対してもマッチするようにします。
        !isIndex,
      );

      return {
        path,
        index: isIndex,
        children: route.children
          ? processRoutesImpl(route.children, path)
          : [],
        component: route.component,
        dataFuncs: (route.dataFunctions || []).map(f => ({
          action: f.action,
          loader: f.loader,
          // 未定義の場合は常に true を返すデフォルト関数を設定します。
          shouldAction: f.shouldAction || (a => a.defaultShouldAction),
          shouldReload: f.shouldReload || (a => a.defaultShouldReload),
        })),
        paramKeys,
        pathPattern,
      };
    })
    .sort((a, b) => compareRoutePaths(a.path, b.path));
}

/**
 * ルート定義の配列を再帰的に処理し、実行時に適した `Route` オブジェクトの配列に変換します。
 *
 * @param routes 変換前のルート定義の配列です。
 * @returns 前処理が施された `Route` オブジェクトの配列を返します。
 */
export default function processRoutes(routes: readonly RouteDefinition[]): readonly Route[] {
  return processRoutesImpl(routes);
}
