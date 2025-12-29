import type { IDataMap } from "./data-map.types.js";
import type { HistoryEntryId } from "./history-entry-id-schema.js";
import type { IAction, ILoader } from "./route.types.js";

/**
 * 読み取り専用のデータストアを表すインターフェースです。
 *
 * 履歴エントリーの ID をキーとし、それに関連付けられたデータマップを値として管理します。
 *
 * @template TDataFunction データマップ内で使用されるアクションまたはローダーの型定義です。
 */
export interface IReadonlyDataStore<TDataFunction extends IAction | ILoader = IAction | ILoader>
  extends Readonly<Map<HistoryEntryId, IDataMap<TDataFunction>>>
{}

/**
 * 書き込み可能なデータストアを表すインターフェースです。
 *
 *  履歴エントリーの ID ごとに、ルートに関連するデータの読み書きを行います。
 *
 * @template TDataFunction データマップ内で使用されるアクションまたはローダーの型定義です。
 */
export interface IDataStore<TDataFunction extends IAction | ILoader = IAction | ILoader>
  extends Map<HistoryEntryId, IDataMap<TDataFunction>>
{}
