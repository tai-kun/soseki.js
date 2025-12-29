/**
 * セグメントの種類に応じたスコア定数です。
 *
 * 数値が大きいほど優先順位（具体性）が高いです。
 */
const SCORE = {
  /**
   * 静的なパスセグメントのスコアです。
   */
  STATIC: 4,

  /**
   * 必須のパラメーターセグメントのスコアです。
   */
  PARAMETER: 3,

  /**
   * 任意のパラメーターセグメントのスコアです。
   */
  OPTIONAL_PARAM: 2,

  /**
   * ワイルドカードセグメントのスコアです。
   */
  WILDCARD: 1,
} as const;

/**
 * 指定されたパスセグメントの文字列から、その種類に応じたスコアを計算します。
 *
 * @param s 解析対象のパスセグメント文字列です。
 * @returns セグメントの種類に基づいた数値スコアを返します。
 */
function getSegmentScore(s: string): number {
  if (s.includes("*")) {
    return SCORE.WILDCARD;
  }

  if (s.startsWith(":")) {
    if (s.endsWith("?")) {
      return SCORE.OPTIONAL_PARAM;
    } else {
      return SCORE.PARAMETER;
    }
  }

  return SCORE.STATIC;
}

/**
 * 2 つのパスを比較し、ルーティングの優先順位に基づいたソート順を決定します。
 *
 * より具体的で深いパスが前方に配置されるように比較を行います。
 *
 * @param pathA 比較対象のパス A です。
 * @param pathB 比較対象のパス B です。
 * @returns 比較結果を示す数値です（負数は pathA が優先、正数は pathB が優先）。
 */
export default function compareRoutePaths(pathA: string, pathB: string): number {
  const partsA = pathA.split("/").filter(Boolean);
  const partsB = pathB.split("/").filter(Boolean);
  const length = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < length; i++) {
    const a = partsA[i];
    // パス A のセグメントが先に終了した場合は、パス B を優先します。
    if (a === undefined) {
      return 1;
    }

    const b = partsB[i];
    // パス B のセグメントが先に終了した場合は、パス A を優先します。
    if (b === undefined) {
      return -1;
    }

    const scoreA = getSegmentScore(a);
    const scoreB = getSegmentScore(b);
    // スコアが異なる場合は、スコアが高い方を優先します。
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    // スコアが同じ場合は、文字列の辞書順で比較します。
    if (a !== b) {
      return a.localeCompare(b);
    }
  }

  return 0;
}
