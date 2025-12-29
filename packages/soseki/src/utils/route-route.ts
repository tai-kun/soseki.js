import type { DataFunctionObject, RouteDefinition } from "../core/route.types.js";

/**
 * ルートの定義を構成するモジュールの型定義です。
 *
 * @template TPath ルートのパス（パスパターン）の型です。
 */
export type RouteModule<TPath extends string = string> = DataFunctionObject<TPath> & {
  /**
   * ルートのパス（パスパターン）です。
   */
  readonly path: TPath;

  /**
   * このルートで描画される React コンポーネントです。
   */
  readonly default?: React.ComponentType<{}> | undefined;
};

/**
 * ルートの起点となるエントリーモジュールの型定義です。
 *
 * データ操作関数の定義を直接含みます。
 *
 * @template TPath ルートのパス（パスパターン）の型です。
 */
export type RouteEntryModule<TPath extends string = string> = DataFunctionObject<TPath> & {
  /**
   * ルートのパス（パスパターン）です。
   */
  readonly path: TPath;

  /**
   * このルートで描画される React コンポーネントです。
   */
  readonly default?: React.ComponentType<{}> | undefined;
};

/**
 * 複数のモジュール配列からルート定義を生成するオーバーロードです。
 *
 * @template TPath ルートのパスの型です。
 * @param mods エントリーモジュールと追加のデータ操作関数の配列です。
 * @param children 子ルートの配列です。
 * @returns 構成されたルート定義オブジェクトを返します。
 */
function route<const TPath extends string = string>(
  mods: readonly [entry: RouteEntryModule<TPath>, ...ui: DataFunctionObject<TPath>[]],
  children: readonly RouteDefinition[],
): RouteDefinition<TPath>;

/**
 * 単一のルートモジュールからルート定義を生成するオーバーロードです。
 *
 * @template TPath ルートのパスの型です。
 * @param mod ルートモジュールオブジェクトです。
 * @param children 子ルートの配列です。
 * @returns 構成されたルート定義オブジェクトを返します。
 */
function route<const TPath extends string = string>(
  mod: RouteModule<TPath>,
  children: readonly RouteDefinition[],
): RouteDefinition<TPath>;

/**
 * ルートモジュールまたはモジュール配列を受け取り、ルート定義を生成します。
 *
 * @template TPath ルートのパスの型です。
 * @param modOrMods ルートモジュールまたはエントリーモジュールを含む配列です。
 * @param children 子ルートの配列です。
 * @returns 構成されたルート定義オブジェクトを返します。
 */
function route<const TPath extends string = string>(
  modOrMods:
    | RouteModule<TPath>
    | readonly [entry: RouteEntryModule<TPath>, ...ui: DataFunctionObject<TPath>[]],
  children: readonly RouteDefinition[],
): RouteDefinition<TPath>;

/**
 * ルート定義を構築する関数の実体です。
 */
function route(
  modOrMods:
    | RouteModule
    | readonly [entry: RouteEntryModule, ...ui: DataFunctionObject[]],
  children: readonly RouteDefinition[],
): RouteDefinition {
  // 配列形式で渡された場合の処理です。
  if (Array.isArray(modOrMods)) {
    const mods = modOrMods;
    const [entry, ...ui] = mods;
    return {
      path: entry.path,
      children,
      component: entry.default,
      dataFunctions: [entry, ...ui],
    };
  }

  // オブジェクト形式で渡された場合の処理です。
  const mod = modOrMods;
  return {
    path: mod.path,
    children,
    component: mod.default,
    dataFunctions: [mod],
  };
}

export default route;
