import singleton from "./_singleton.js";
import * as v from "./_valibot.js";

/**
 * 履歴エントリー ID のバリデーションスキーマを作成、または取得します。
 *
 * @returns 履歴エントリー ID のスキーマです。
 */
const HistoryEntryIdSchema = () => (singleton("HistoryEntryIdSchema", () => (
  v.pipe(
    v.string(),
    v.uuid(),
    v.brand("HistoryEntryId"),
  )
)));

/**
 * 履歴エントリー ID として受け入れ可能な入力型の定義です（バリデーション前の文字列など）。
 */
export type HistoryEntryIdLike = v.InferInput<ReturnType<typeof HistoryEntryIdSchema>>;

/**
 * バリデーション済みでブランド化された、履歴エントリー ID の出力型の定義です。
 */
export type HistoryEntryId = v.InferOutput<ReturnType<typeof HistoryEntryIdSchema>>;

export default HistoryEntryIdSchema;
