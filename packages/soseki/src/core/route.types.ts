import type * as React from "react";
import type { RouteParams } from "regexparam";
import type { ReadonlyURL } from "./readonly-url.types.js";
import type RouteRequest from "./route-request.js";

/**
 * パスパラメーターの内部的な型定義です。
 *
 * @template TParams `regexparam` から抽出されたパラメーターの型です。
 */
// dprint-ignore
type PathParams_<TParams extends { [_ in string]?: string }> =
    [keyof TParams] extends [never]
  ? { readonly [_ in string]?: string }
  : Readonly<TParams>

/**
 * 指定されたパス文字列からパラメーターを抽出するための型定義です。
 *
 * @template TPath 解析対象となるパス文字列の型です。
 */
export type PathParams<TPath extends string = string> = PathParams_<RouteParams<TPath>>;

/**
 * アクションを実行すべきかどうかを判定する関数（`shouldAction`）に渡される引数の型定義です。
 *
 * @template TPath パス文字列の型です。
 */
export type ShouldActionArgs<TPath extends string = string> = {
  /**
   * URL から抽出されたパスパラメーターのオブジェクトです。
   */
  params: PathParams<TPath>;

  /**
   * ルーティングに関するリクエスト情報です。
   */
  request: RouteRequest;

  /**
   * デフォルトのルールに基づいた判定結果です。
   */
  defaultShouldAction: boolean;
};

/**
 * 特定の条件でアクションを実行するかどうかを制御するインターフェースです。
 *
 * @template TPath パス文字列の型です。
 */
export interface IShouldAction<TPath extends string = string> {
  /**
   * アクションの実行可否を判定します。
   *
   * @param args 判定に必要なパラメーターとリクエスト情報です。
   * @returns アクションを実行する場合は `true`、そうでない場合は `false` を返します。
   */
  (args: ShouldActionArgs<TPath>): boolean;
}

/**
 * アクション関数（`action`）に渡される引数の型定義です。
 *
 * @template TPath パス文字列の型です。
 */
export type ActionArgs<TPath extends string = string> = {
  /**
   * URL から抽出されたパスパラメーターのオブジェクトです。
   */
  params: PathParams<TPath>;

  /**
   * ルーティングに関するリクエスト情報です。
   */
  request: RouteRequest;
};

/**
 * データの更新処理などを行うアクション関数のインターフェースです。
 *
 * @template TPath パス文字列の型です。
 * @template TData アクションが返すデータの型です。
 */
export interface IAction<TPath extends string = string, TData = unknown> {
  /**
   * 指定された引数に基づいてアクションを実行します。
   *
   * @param args アクションの実行に必要なパラメーターとリクエスト情報です。
   * @returns 処理結果として任意のデータを返します。
   */
  (args: ActionArgs<TPath>): TData;
}

/**
 * データの再読み込み（リロード）を行うべきかどうかを判定する関数に渡される引数の型定義です。
 *
 * GET リクエスト時と POST リクエスト時で異なるプロパティーを持ちます。
 *
 * @template TPath 現在のパス文字列の型です。
 */
export type ShouldReloadArgs<TPath extends string = string> = {
  /**
   * 最読み込みをトリガーしたリクエストメソッドです。
   */
  triggerMethod: "GET";

  /**
   * 現在の URL オブジェクトです。
   */
  currentUrl: ReadonlyURL;

  /**
   * 現在のパスパラメーターです。
   */
  currentParams: PathParams<TPath>;

  /**
   * 遷移前の URL オブジェクトです。
   */
  prevUrl: ReadonlyURL;

  /**
   * 遷移前のパスパラメーターです。
   */
  prevParams: PathParams;

  /**
   * 送信されたフォームデータです。GET 時は常にありません。
   */
  formData?: undefined;

  /**
   * 直前に行われたアクションの結果です。GET 時は常にありません。
   */
  actionResult?: undefined;

  /**
   * デフォルトのルールに基づいた判定結果です。
   */
  defaultShouldReload: boolean;
} | {
  /**
   * 最読み込みをトリガーしたリクエストメソッドです。
   */
  triggerMethod: "POST";

  /**
   * 現在の URL オブジェクトです。
   */
  currentUrl: ReadonlyURL;

  /**
   * 現在のパスパラメーターです。
   */
  currentParams: PathParams<TPath>;

  /**
   * 遷移前の URL オブジェクトです。
   */
  prevUrl: ReadonlyURL;

  /**
   * 遷移前のパスパラメーターです。
   */
  prevParams: PathParams;

  /**
   * 送信されたフォームデータです。
   */
  formData: FormData;

  /**
   * 直前に行われたアクションの結果です。
   */
  actionResult?: unknown;

  /**
   * デフォルトのルールに基づいた判定結果です。
   */
  defaultShouldReload: boolean;
};

/**
 * データの再読み込みが必要かどうかを判定するインターフェースです。
 *
 * @template TPath パス文字列の型です。
 */
export interface IShouldReload<TPath extends string = string> {
  /**
   * 再読み込みの要否を判定します。
   *
   * @param args 遷移先後やアクションの結果を含む判定用データです。
   * @returns 再読み込みを行う場合は `true`、そうでない場合は `false` を返します。
   */
  (args: ShouldReloadArgs<TPath>): boolean;
}

/**
 * ローダー関数（`loader`）に渡される引数の型定義です。
 *
 * @template TPath パス文字列の型です。
 */
export type LoaderArgs<TPath extends string = string> = {
  /**
   * URL から抽出されたパスパラメーターのオブジェクトです。
   */
  params: PathParams<TPath>;

  /**
   * ルーティングに関するリクエスト情報です。
   */
  request: RouteRequest;
};

/**
 * データを取得するためのローダー関数のインターフェースです。
 *
 * @template TPath パス文字列の型です。
 * @template TData ローダーが取得するデータの型です。
 */
export interface ILoader<TPath extends string = string, TData = unknown> {
  /**
   * 指定された引数に基づいてデータを読み込みます。
   *
   * @param args データ取得に必要なパラメーターとリクエスト情報です。
   * @returns 取得したデータを返します。
   */
  (args: LoaderArgs<TPath>): TData;
}

/**
 * ルートに紐づくデータ処理用の関数群をまとめたオブジェクトの型定義です。
 *
 * @template TPath パス文字列の型です。
 */
export type DataFunctionObject<TPath extends string = string> = {
  /**
   * アクションを実行すべきか判定するオプションの関数です。
   */
  readonly shouldAction?: IShouldAction<TPath> | undefined;

  /**
   * データの更新などを行うオプションのアクション関数です。
   */
  readonly action?: IAction<TPath> | undefined;

  /**
   * データを再読み込みすべきか判定するオプションの関数です。
   */
  readonly shouldReload?: IShouldReload<TPath> | undefined;

  /**
   * データを取得するオプションのローダー関数です。
   */
  readonly loader?: ILoader<TPath> | undefined;
};

/**
 * ルーティングの定義を表す型定義です。
 *
 * @template TPath パス文字列の型です。
 */
export type RouteDefinition<TPath extends string = string> = {
  /**
   * ルートのパス（パスパターン）です。
   */
  readonly path: TPath;

  /**
   * このルートで使用するデータ操作関数の配列です。
   */
  readonly dataFunctions?: readonly DataFunctionObject<TPath>[] | undefined;

  /**
   * このルートで描画される React コンポーネントです。
   */
  readonly component?: React.ComponentType<{}> | undefined;

  /**
   * 子ルートの定義リストです。
   */
  readonly children?: readonly RouteDefinition[] | undefined;
};

/**
 * ルート情報を表す型定義です。
 */
export type Route = {
  /**
   * 正規化されたルートのパス（パスパターン）です。
   */
  readonly path: string;

  /**
   * このルートがインデックスルート（子ルートを持たない末端のルート）かどうかを示します。
   */
  readonly index: boolean;

  /**
   * パスマッチングに使用される正規表現オブジェクトです。
   */
  readonly pathPattern: RegExp;

  /**
   * パスから抽出されたパラメーター名の配列です。
   */
  readonly paramKeys: readonly string[];

  /**
   * このルートに紐づくデータ操作関数群の配列です。
   *
   * デフォルトの判定関数などが補完された状態で保持されます。
   */
  readonly dataFuncs: readonly {
    /**
     * アクションの実行可否を判定します。
     *
     * @param args 判定に必要なパラメーターとリクエスト情報です。
     * @returns アクションを実行する場合は `true`、そうでない場合は `false` を返すはずです。
     */
    readonly shouldAction: (args: ShouldActionArgs) => unknown;

    /**
     * データの更新などを行うオプションのアクション関数です。
     */
    readonly action: IAction | undefined;

    /**
     * 再読み込みの要否を判定します。
     *
     * @param args 遷移先後やアクションの結果を含む判定用データです。
     * @returns 再読み込みを行う場合は `true`、そうでない場合は `false` を返すはずです。
     */
    readonly shouldReload: (args: ShouldReloadArgs) => unknown;

    /**
     * データを取得するオプションのローダー関数です。
     */
    readonly loader: ILoader | undefined;
  }[];

  /**
   * このルートで描画される React コンポーネントです。
   */
  readonly component: React.ComponentType<{}> | undefined;

  /**
   * 前処理済みの子ルートの配列です。
   */
  readonly children: readonly Route[];
};
