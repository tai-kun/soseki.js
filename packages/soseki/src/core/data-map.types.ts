import type DeferredPromise from "./deferred-promise.js";
import type { IAction, ILoader } from "./route.types.js";

/**
 * 読み取り専用のデータマップを表すインターフェースです。
 *
 * ルートに関連付けられたアクションやローダーの関数をキーとし、その実行結果を値として保持します。
 *
 * @template TDataFunction アクションまたはローダーの型定義です。デフォルトは `IAction | ILoader` です。
 * @template TData 遅延評価されるプロミスの型定義です。デフォルトは `DeferredPromise<unknown>` です。
 */
export interface IReadonlyDataMap<
  TDataFunction extends IAction | ILoader = IAction | ILoader,
  TData = DeferredPromise<unknown>,
> extends ReadonlyMap<TDataFunction, TData> {}

/**
 * 書き込み可能なデータマップを表すインターフェースです。
 *
 * ルートに関連付けられたアクションやローダーの関数をキーとし、その実行結果を値として保持・操作します。
 *
 * @template TDataFunction アクションまたはローダーの型定義です。デフォルトは `IAction | ILoader` です。
 * @template TData 遅延評価されるプロミスの型定義です。デフォルトは `DeferredPromise<unknown>` です。
 */
export interface IDataMap<
  TDataFunction extends IAction | ILoader = IAction | ILoader,
  TData = DeferredPromise<unknown>,
> extends Map<TDataFunction, TData> {}
