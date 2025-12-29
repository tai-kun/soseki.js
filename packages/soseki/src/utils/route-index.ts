import type { DataFunctionObject, RouteDefinition } from "../core/route.types.js";
import route, { type RouteEntryModule, type RouteModule } from "./route-route.js";

/**
 * インデックスルートの定義を構成するモジュールの型定義です。
 *
 * @template TPath ルートのパス（パスパターン）の型です。
 */
export type IndexRouteModule<TPath extends string = string> = RouteModule<TPath>;

/**
 * インデックスルートの起点となるエントリーモジュールの型定義です。
 *
 * @template TPath ルートのパス（パスパターン）の型です。
 */
export type IndexRouteEntryModule<TPath extends string = string> = RouteEntryModule<TPath>;

/**
 * 複数のモジュール配列からインデックスルート定義を生成するオーバーロードです。
 *
 * @template TPath ルートのパスの型です。
 * @param mods エントリーモジュールと追加のデータ操作関数の配列です。
 * @returns 構成されたインデックスルート定義オブジェクトを返します。
 */
function index<const TPath extends string = string>(
  mods: readonly [entry: IndexRouteEntryModule<TPath>, ...ui: DataFunctionObject<TPath>[]],
): RouteDefinition<TPath>;

/**
 * 単一のルートモジュールからインデックスルート定義を生成するオーバーロードです。
 *
 * @template TPath ルートのパスの型です。
 * @param mod ルートモジュールオブジェクトです。
 * @returns 構成されたインデックスルート定義オブジェクトを返します。
 */
function index<const TPath extends string = string>(
  mod: IndexRouteModule<TPath>,
): RouteDefinition<TPath>;

/**
 * インデックスルートモジュールまたはモジュール配列を受け取り、インデックスルート定義を生成します。
 *
 * @template TPath ルートのパスの型です。
 * @param modOrMods ルートモジュールまたはエントリーモジュールを含む配列です。
 * @param children 子ルートの配列です（インデックスルートでは通常使用されません）。
 * @returns 構成されたインデックスルート定義オブジェクトを返します。
 */
function index<const TPath extends string = string>(
  modOrMods:
    | IndexRouteModule<TPath>
    | readonly [entry: IndexRouteEntryModule<TPath>, ...ui: DataFunctionObject<TPath>[]],
  children: readonly RouteDefinition[],
): RouteDefinition<TPath>;

/**
 * インデックスルート定義を構築する関数の実体です。
 * `route` 関数を利用して定義を生成し、`children` を明示的に `undefined` に設定します。
 */
function index(
  arg0:
    | IndexRouteModule
    | readonly [entry: IndexRouteEntryModule, ...ui: DataFunctionObject[]],
): RouteDefinition {
  // route 関数でベースとなる定義を生成した後、子ルートを持たないように上書きします。
  return Object.assign(route(arg0, []), {
    children: undefined,
  });
}

export default index;
