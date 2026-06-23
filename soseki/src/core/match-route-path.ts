import { parse } from "regexparam";

import RoutePath from "./route-path.js";

/**
 * ルーティングの照合対象となる URL 情報を表すインターフェースです。
 */
export interface MatchRoutePathTargetURL {
  /**
   * 照合対象のパス名です。
   */
  readonly pathname: string;
}

/**
 * `matchRoutePath` 関数の動作を設定するための型定義です。
 */
export type MatchRoutePathOptions = {
  /**
   * 照合の基準となるルーティングのパターン文字列です。
   */
  readonly pattern: string;

  /**
   * 照合対象とする文字列または URL オブジェクトです。
   */
  readonly target: string | MatchRoutePathTargetURL;

  /**
   * 子ディレクトリーへの前方一致を許可するかどうかを制御するフラグです。
   *
   * @default false
   */
  readonly allowChild?: boolean | undefined;
};

/**
 * 指定されたパターンと対象のパス名が一致するかどうかを判定します。
 *
 * @param options パターン、対象、および一致条件を含む設定オブジェクトです。
 * @returns パターンに一致した場合は `true` を、一致しない場合は `false` を返します。
 */
function matchRoutePath(options: MatchRoutePathOptions): boolean;

/**
 * 指定されたパターンと対象のパス名が一致するかどうかを判定します。
 *
 * @param pattern 照合の基準となるルーティングのパターン文字列です。
 * @param target 照合対象とする文字列または URL オブジェクトです。
 * @param options オプションです。
 * @returns パターンに一致した場合は `true` を、一致しない場合は `false` を返します。
 */
function matchRoutePath(
  pattern: MatchRoutePathOptions["pattern"],
  target: MatchRoutePathOptions["target"],
  options?: Omit<MatchRoutePathOptions, "pattern" | "target">,
): boolean;

function matchRoutePath(...args: any): boolean {
  const {
    target,
    pattern,
    allowChild = false,
  }: MatchRoutePathOptions = typeof args[0] !== "string"
    ? args[0]
    : {
        ...args[2],
        target: args[1],
        pattern: args[0],
      };
  const patternPathname = new RoutePath(pattern).pathname;
  const targetPathname = typeof target === "string" ? target : target.pathname;
  const patternRegex = parse(patternPathname, allowChild).pattern;

  return patternRegex.test(targetPathname);
}

export default matchRoutePath;
