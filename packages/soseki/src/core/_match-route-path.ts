import type { PathParams, Route } from "./route.types.js";

/**
 * パスマッチングの結果を表す型定義です。
 */
export type MatchPathResult = {
  /**
   * パスから抽出されたパラメーターのキーと値のペアです。
   */
  params: PathParams;
};

/**
 * 指定されたルートの正規表現パターンを使用して、パス名がマッチするかどうかを判定します。
 *
 * @param route 判定対象となる前処理済みのルートオブジェクトです。
 * @param pathname マッチングを行う対象のパス名（URL のパス部分）です。
 * @returns マッチした場合はパラメーターを含むオブジェクトを返し、マッチしない場合は `null` を返します。
 */
export default function matchPath(
  route: Pick<Route, "paramKeys" | "pathPattern">,
  pathname: string,
): MatchPathResult | null {
  const matches = route.pathPattern.exec(pathname);
  if (!matches) {
    return null;
  }

  const params: Record<string, string> = {};
  for (let i = 0, value: string | undefined; i < route.paramKeys.length; i++) {
    value = matches[i + 1];
    if (value !== undefined) {
      // route.paramKeys のインデックスと matches のキャプチャーグループを対応させます。
      params[route.paramKeys[i]!] = value;
    }
  }

  return { params };
}
