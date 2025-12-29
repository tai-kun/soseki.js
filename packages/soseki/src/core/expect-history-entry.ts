import singleton from "./_singleton.js";
import * as v from "./_valibot.js";
import HistoryEntryIdSchema, { type HistoryEntryId } from "./history-entry-id-schema.js";
import HistoryEntryUrlSchema, { type HistoryEntryUrl } from "./history-entry-url-schema.js";

/**
 * 履歴エントリーのバリデーションスキーマを生成、または取得します。
 *
 * 識別子、URL、および 0 以上の整数であるインデックスを持つオブジェクト構造を定義します。
 *
 * @returns 履歴エントリーのスキーマです。
 */
const HistoryEntrySchema = () => (singleton("HistoryEntrySchema", () => (
  v.object({
    id: HistoryEntryIdSchema(),
    url: v.nullable(HistoryEntryUrlSchema()),
    index: v.pipe(
      v.number(),
      v.safeInteger(),
      v.minValue(0),
    ),
  })
)));

/**
 * 履歴エントリーとして受け入れ可能な入力型の定義です。
 */
export type HistoryEntryLike = Readonly<v.InferInput<ReturnType<typeof HistoryEntrySchema>>>;

/**
 * バリデーション済みの履歴エントリーを表す型定義です。
 */
export type HistoryEntry = {
  /**
   * 履歴エントリーを一意に識別する ID です。
   */
  readonly id: HistoryEntryId;

  /**
   * 正規化済みの URL オブジェクトです。
   */
  readonly url: HistoryEntryUrl;

  /**
   * 0 以上の整数で表される履歴のインデックスです。
   */
  readonly index: number;
};

/**
 * 入力値が履歴エントリーの形式を満たしているか検証します。
 *
 * @param entry 検証対象のオブジェクトです。
 * @returns バリデーション済み、かつ URL が存在する履歴エントリーです。
 */
function expectHistoryEntry(entry: HistoryEntryLike): HistoryEntry;

/**
 * 入力値が履歴エントリーの形式を満たしているか検証します。
 *
 * @param entry 検証対象のオブジェクト、または null 系値です。
 * @returns 検証に成功した場合は履歴エントリーを、入力が null もしくは URL が欠損している場合は null を返します。
 */
function expectHistoryEntry(entry: HistoryEntryLike | null | undefined): HistoryEntry | null;

/**
 * 入力値が履歴エントリーの形式を満たしているか検証します。
 *
 * @param entry 検証対象のデータです。
 * @returns 検証結果に基づく履歴エントリー、または null です。
 */
function expectHistoryEntry(entry: HistoryEntryLike | null | undefined): HistoryEntry | null {
  if (entry == null) {
    return null;
  }

  const {
    id,
    url,
    index,
  } = v.expect(HistoryEntrySchema(), entry);

  // URL が nullable として定義されていますが、この関数では URL が存在することを必須とします。
  if (!url) {
    return null;
  }

  return {
    id,
    url,
    index,
  };
}

export default expectHistoryEntry;
