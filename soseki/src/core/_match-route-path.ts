import type { ReadonlyURL } from "./readonly-url.types.js";
import type { Route, RoutePathParams } from "./route.types.js";

/**
 * パスマッチングの処理結果を表すオブジェクトの型定義です。
 */
export type MatchPathResult = {
  /**
   * マッチした URL パスから抽出されたパラメーターのキーと値のオブジェクトです。
   */
  params: RoutePathParams;
};

/**
 * 指定されたルートの正規表現パターンと URL のパス部分を照合し、マッチング検証およびパラメーター抽出を行う関数です。
 *
 * ルーティングエンジンが、現在の遷移先 URL に適合するルートを特定し、動的セグメントの値を型安全に回収する目的で使用します。
 *
 * @param route 検証対象となるルートオブジェクトから、マッチングに必要な `paramKeys` と `pathPattern` を抽出したオブジェクトです。
 * @param url マッチングの判定元となる、読み取り専用の URL オブジェクトです。
 * @returns マッチした場合は抽出されたパラメーターを含む `MatchPathResult` を返し、マッチしなかった場合は `null` を返します。
 */
export default function matchPath(
  route: Pick<Route, "paramKeys" | "pathPattern">,
  url: ReadonlyURL,
): MatchPathResult | null {
  const matches = route.pathPattern.exec(url.pathname);
  if (!matches) {
    return null;
  }

  const params: Record<string, string> = {};
  for (let i = 0, param: string | undefined; i < route.paramKeys.length; i++) {
    // exec メソッドの戻り値のインデックス 0 にはマッチした文字列全体が格納されているため、各パラメーターの値はインデックス 1 以降（i + 1）から取得します。
    param = matches[i + 1];

    // キャプチャーされたセグメントが存在し、かつ文字列型である場合にのみ、対応するパラメーターキーと値をマッピングします。
    // オプショナルなパラメーターが URL 側で省略されている場合は undefined となるため、この条件節により除外されます。
    if (typeof param === "string") {
      params[route.paramKeys[i]!] = param;
    }
  }

  return { params };
}
