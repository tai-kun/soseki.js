import type { PathParams } from "../core/route.types.js";
import useRouteContext from "./_use-route-context.js";

/**
 * 現在のルートにマッチしたパスパラメーターを取得するためのカスタムフックです。
 *
 * @returns 現在のパスパラメーターを含むオブジェクトを返します。
 */
export default function useParams<TPath extends string = string>(): PathParams<TPath> {
  return useRouteContext().params as PathParams<TPath>;
}
