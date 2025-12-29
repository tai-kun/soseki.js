import singleton from "./_singleton.js";
import * as v from "./_valibot.js";
import type { ReadonlyURL } from "./readonly-url.types.js";

/**
 * 履歴エントリー URL のバリデーションおよび変換スキーマを作成、または取得します。
 *
 * 文字列が有効な URL であるかを確認し、クエリーパラメーターをソートして正規化した `ReadonlyURL` オブジェクトを返します。
 *
 * @returns 履歴エントリー URL のスキーマです。
 */
const HistoryEntryUrlSchema = () => (singleton("HistoryEntryUrlSchema", () => (
  v.pipe(
    v.string(),
    v.url(),
    v.transform(function createNormalizedUrl(s): ReadonlyURL {
      const u = new URL(s);
      // 同一の URL として比較しやすくするため、クエリーパラメーターを昇順にソートします。
      u.searchParams.sort();
      return u;
    }),
  )
)));

/**
 * 履歴エントリー URL として受け入れ可能な入力型の定義です（バリデーション前の文字列など）。
 */
export type HistoryEntryUrlLike = v.InferInput<ReturnType<typeof HistoryEntryUrlSchema>>;

/**
 * バリデーションおよび正規化が行われた後の、履歴エントリー URL の出力型の定義です。
 */
export type HistoryEntryUrl = v.InferOutput<ReturnType<typeof HistoryEntryUrlSchema>>;

export default HistoryEntryUrlSchema;
