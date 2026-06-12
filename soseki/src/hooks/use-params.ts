import type { RoutePathParams } from "../core/route.types.js";
import useRouteContext from "./use-route-context.js";

/**
 * 現在のルートにマッチしたパスパラメーターを取得するためのカスタムフックです。
 *
 * @returns 現在のパスパラメーターを含むオブジェクトを返します。
 */
export default function useParams<TPath extends string = string>(): RoutePathParams<TPath> {
  return useRouteContext().params as RoutePathParams<TPath>;
}
