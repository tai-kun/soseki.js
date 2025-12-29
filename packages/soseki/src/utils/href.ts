import { inject, type RouteParams } from "regexparam";
import type { PathParams } from "../core/route.types.js";

/**
 * 指定されたパスのテンプレートにパラメーターを注入し、完全な URL パスを生成します。
 *
 * @template TPath パスのテンプレート文字列の型です。
 * @param path パスのテンプレート文字列です（例: `/users/:id`）。
 * @param params パスに注入するパラメーターのオブジェクトです。
 * @returns パラメーターが注入された後の文字列を返します。
 */
export default function href<const TPath extends string>(
  path: TPath,
  params: PathParams<TPath>,
): string {
  return inject(path, params as RouteParams<TPath>);
}
