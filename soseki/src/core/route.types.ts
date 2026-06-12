import type * as React from "react";

import type { ReadonlyURL } from "./readonly-url.types.js";
import type { RouteGetRequest, RoutePostRequest } from "./route-request.js";

/**
 * 個別のパスパラメーターを解析し、適切なプロパティーの型オブジェクトへと変換する内部ユーティリティー型です。
 *
 * パラメーターの末尾の形状を条件付き型により詳細に選別します。
 *
 * @template Param 解析対象となる単一のパラメーター文字列です。
 */
// oxfmt-ignore
type ParamRecord<Param extends string> =
  // パラメーター末尾に「?」がある場合、オプショナルなプロパティー型に変換します
    Param extends `${infer Name}?`
    ? { [K in Name]?: string }

  // パラメーターに拡張子が含まれている場合、拡張子を除いた名前を必須のプロパティー型に変換します。
  : Param extends `${infer Name}.${string}`
    ? { [K in Name]: string }

  // 上記のいずれのパターンにも該当しない場合は、パラメーター名をそのまま必須のプロパティー型に変換します。
  : { [K in Param]: string };

/**
 * パス文字列のセグメントから動的なパラメーターやワイルドカードを再帰的に抽出し、型安全なオブジェクト構造を構築するユーティリティー型です。
 *
 * 開発者が指定した文字列リテラル型の形状に基づいて、ルーティングに必要なパラメーターの型を静的に決定します。
 *
 * このユーティリティー型は、ライブラリー `regexparam` の改良版です。
 *
 * @template T 解析対象となる URL パス全体の文字列リテラル型です。
 * @see https://github.com/lukeed/regexparam
 * @see https://github.com/lukeed/regexparam/issues/31
 * @see https://github.com/lukeed/regexparam/pull/33
 */
// oxfmt-ignore
type RouteParams<T extends string> =
  // 与えられた型が具体的なリテラルでなく文字列型である場合は、汎用的なレコード型へとフォールバックします。
    string extends T
    ? { [K in string]?: string }

  // パスの中間にワイルドカードが存在する場合、前後のパラメーターに加えて、必須のワイルドカードプロパティーを結合します。
  : T extends `${infer Prev}/*/${infer Rest}`
    ? & RouteParams<Prev>
      & { wild: string }
      & RouteParams<`/${Rest}`>

  // パスの先頭がコロンで開始されている場合、先頭にスラッシュ（/）を補正して再帰的に再評価します。
  : T extends `:${infer Rest}`
    ? RouteParams<`/:${Rest}`>

  // パスの中間にコロンで始まるパラメーターが含まれている場合、そのセグメントの型情報を抽出し、スラッシュ以降の残りのパスの解析結果と交差型で結合します。
  : T extends `${string}:${infer Param}/${infer Rest}`
    ? & ParamRecord<Param>
      & RouteParams<`/${Rest}`>

  // パスの末尾がコロンで始まるパラメーターで終了している場合、そのセグメントの型情報を判定して抽出を完了します。
  : T extends `${string}/:${infer Param}`
    ? ParamRecord<Param>

  // パスの末尾がオプショナルワイルドカードで終了している場合、キー名を「"*"」としたオプショナルなプロパティー型を返します。
  : T extends `${string}/*?`
    ? { "*"?: string }

  // パスの末尾が通常のワイルドカードで終了している場合、キー名を「"*"」とした必須のプロパティー型を返します。
  : T extends `${string}/*`
    ? { "*": string }

  // 抽出可能なパラメーターやワイルドカードが一切検出されなかった場合は、空のオブジェクト型を返します。
  : {};

/**
 * 文字列リテラルとして定義されたパスの形状から、含まれるパスパラメーターを解析し、静的に型付けされたオブジェクトとして抽出する型定義です。
 *
 * @template TRoutePath パラメーター抽出の対象となるパス文字列リテラル型です。
 */
export type RoutePathParams<TRoutePath extends string = string> = Readonly<RouteParams<TRoutePath>>;

/**
 * データ更新などのアクション処理を実行する際に、該当する関数へ渡される引数の型定義です。
 *
 * 解析済みのパスパラメーターと、HTTP の POST メソッドを抽象化したリクエストオブジェクトを含みます。
 *
 * @template TRoutePath 対象となるルートのパス文字列リテラル型です。
 */
export type ActionFunctionArgs<TRoutePath extends string = string> = {
  /**
   * 現在の URL パスから抽出されたパラメーターオブジェクトです。
   */
  params: RoutePathParams<TRoutePath>;

  /**
   * フォームデータなどを内包する、HTTP の POST メソッドに特化したルーティングリクエストオブジェクトです。
   */
  request: RoutePostRequest;
};

/**
 * データの登録、更新、削除といった副作用を伴うアクション処理を定義するための関数インターフェースです。
 *
 * @template TRoutePath 対象となるルートのパス文字列リテラル型です。
 * @template TData アクション関数が返す戻り値の型定義です。既定値は `unknown` です。
 */
export interface ActionFunction<TRoutePath extends string = string, TData = unknown> {
  (args: ActionFunctionArgs<TRoutePath>): TData;
}

/**
 * ページ遷移やデータ更新が発生した際、現在の画面データを再読み込みすべきかどうかを判定する関数へ渡される引数の型定義です。
 *
 * アクションを実行した契機となる HTTP メソッドの種類（GET / POST）に応じて、含まれるコンテキスト情報が分岐します。
 *
 * @template TRoutePath 対象となるルートのパス文字列リテラル型です。
 */
export type ShouldReloadFunctionArgs<TRoutePath extends string = string> =
  | {
      /**
       * 再読み込みを引き起こした HTTP メソッドの種別です。
       */
      triggerMethod: "GET";

      /**
       * 現在の画面に対応する読み取り専用 URL オブジェクトです。
       */
      currentUrl: ReadonlyURL;

      /**
       * 現在の URL から抽出されたパスパラメーターです。
       */
      currentParams: RoutePathParams<TRoutePath>;

      /**
       * POST リクエストが発生する直前の読み取り専用 URL オブジェクトです。
       */
      prevUrl: ReadonlyURL;

      /**
       * POST リクエストが発生する直前の URL から抽出されたパスパラメーターです。
       */
      prevParams: RoutePathParams;

      /**
       * システムが内部ロジックに基づいて判断した、再読み込み実行の既定の判定フラグです。
       */
      defaultShouldReload: boolean;
    }
  | {
      /**
       * 再読み込みを引き起こした HTTP メソッドの種別です。
       */
      triggerMethod: "POST";

      /**
       * 現在の画面に対応する読み取り専用 URL オブジェクトです。
       */
      currentUrl: ReadonlyURL;

      /**
       * 現在の URL から抽出されたパスパラメーターです。
       */
      currentParams: RoutePathParams<TRoutePath>;

      /**
       * POST リクエストが発生する直前の読み取り専用 URL オブジェクトです。
       */
      prevUrl: ReadonlyURL;

      /**
       * POST リクエストが発生する直前の URL から抽出されたパスパラメーターです。
       */
      prevParams: RoutePathParams;

      /**
       * POST リクエストと共に送信された標準のフォームデータオブジェクトです。
       */
      formData: FormData;

      /**
       * 直前に実行されたアクション関数から返されたデータです。
       */
      actionData: unknown;

      /**
       * システムが内部ロジックに基づいて判断した、再読み込み実行の既定の判定フラグです。
       */
      defaultShouldReload: boolean;
    };

/**
 * ルートデータの再読み込みが不必要な場合に、余分な通信や再取得処理を抑制するための判定関数インターフェースです。
 *
 * @template TRoutePath 対象となるルートのパス文字列リテラル型です。
 * @returns データを再読み込みする場合は `true`、スキップする場合は `false` を返します。
 */
export interface ShouldReloadFunction<TRoutePath extends string = string> {
  (args: ShouldReloadFunctionArgs<TRoutePath>): boolean;
}

/**
 * 画面の描画に必要なデータを取得（ロード）する際に、該当する関数へ渡される引数の型定義です。
 *
 * 解析済みのパスパラメーターと、HTTP の GET メソッドを抽象化したリクエストオブジェクトを含みます。
 *
 * @template TRoutePath 対象となるルートのパス文字列リテラル型です。
 */
export type LoaderFunctionArgs<TRoutePath extends string = string> = {
  /**
   * 現在の URL パスから抽出されたパラメーターオブジェクトです。
   */
  params: RoutePathParams<TRoutePath>;

  /**
   * HTTP の GET メソッドに特化したルーティングリクエストオブジェクトです。
   */
  request: RouteGetRequest;
};

/**
 * 画面の初期描画時や遷移時にデータをオンデマンドで取得するための関数インターフェースです。
 *
 * @template TRoutePath 対象となるルートのパス文字列リテラル型です。
 * @template TData ローダー関数が返す戻り値の型定義です。既定値は `unknown` です。
 */
export interface LoaderFunction<TRoutePath extends string = string, TData = unknown> {
  (args: LoaderFunctionArgs<TRoutePath>): TData;
}

/**
 * アプリケーションのルーティング設定を定義するためのオブジェクトの型定義です。
 *
 * 開発者が宣言的にルーティングのツリーやリストを記述する際に使用します。
 *
 * @template TPath ルートに関連付けるパス文字列リテラル型です。
 */
export type RouteDefinitionObject<TPath extends string = string> = {
  /**
   * マッチングの対象となる URL パスのパターン文字列です。
   */
  readonly path: TPath;

  /**
   * 親ルートのパスにおいて、インデックスルートとして機能させるかどうかのフラグです。
   */
  readonly index?: boolean | undefined;

  /**
   * このルートで実行されるデータ更新用のアクション関数です。
   */
  readonly action?: ActionFunction<TPath> | undefined;

  /**
   * このルートのデータ再読み込み動作を制御する判定関数です。
   */
  readonly shouldReload?: ShouldReloadFunction<TPath> | undefined;

  /**
   * このルートの画面描画に必要なデータを取得する関数です。
   */
  readonly loader?: LoaderFunction<TPath> | undefined;

  /**
   * このルートに対応して描画される React のコンポーネントです。
   */
  readonly component?: React.ComponentType<{}> | undefined;
};
/**
 * ルーティング設定をインポート経由で定義するための構造体型定義です。
 *
 * @template TPath ルートに関連付けるパス文字列リテラル型です。
 */
export type RouteDefinitionModule<TPath extends string = string> = {
  /**
   * マッチングの対象となる URL パスのパターン文字列です。
   */
  readonly path: TPath;

  /**
   * 親ルートのパスにおいて、インデックスルートとして機能させるかどうかのフラグです。
   */
  readonly index?: boolean | undefined;

  /**
   * このルートで実行されるデータ更新用のアクション関数です。
   */
  readonly action?: ActionFunction<TPath> | undefined;

  /**
   * このルートのデータ再読み込み動作を制御する判定関数です。
   */
  readonly shouldReload?: ShouldReloadFunction<TPath> | undefined;

  /**
   * このルートの画面描画に必要なデータを取得する関数です。
   */
  readonly loader?: LoaderFunction<TPath> | undefined;

  /**
   * このルートに対応して描画される React のコンポーネントです。
   *
   * `default` プロパティーよりこちらが優先されます。
   */
  readonly component?: React.ComponentType<{}> | undefined;

  /**
   * ES モジュールのデフォルトエクスポートとして定義された、描画対象となる React のコンポーネントです。
   *
   * `component` プロパティーがない場合はこちらにフォールバックされます。
   */
  readonly default?: React.ComponentType<{}> | undefined;

  /**
   * オブジェクトの文字列表現をカスタマイズするための組み込みタグプロパティーです。
   *
   * モジュールオブジェクトとしての識別に使用します。
   */
  get [Symbol.toStringTag](): string;
};

/**
 * アプリケーションのルーティング設定を定義するためのオブジェクトの型定義です。
 *
 * @template TPath ルートに関連付けるパス文字列リテラル型です。
 */
export type RouteDefinition<TPath extends string = string> =
  | RouteDefinitionObject<TPath>
  | RouteDefinitionModule<TPath>;

/**
 * `RouteDefinition` を基にシステム内部で解析・コンパイルされ、ルーティングエンジンが直接処理を行うための実体化されたルートオブジェクトの型定義です。
 *
 * 省略可能だったプロパティーが正規化され、正規表現によるマッチング機構が追加されています。
 */
export type Route = {
  /**
   * マッチングの対象となる URL パスのパターン文字列です。
   */
  readonly path: string;

  /**
   * インデックスルートであるかどうかの確定的なフラグです。
   */
  readonly index: boolean;

  /**
   * 実際の URL パスがこのルートに合致するかを検証するために動的に生成された正規表現オブジェクトです。
   */
  readonly pathPattern: RegExp;

  /**
   * パスパターン内に含まれるパラメーターのキー名を、順番通りに格納した読み取り専用の配列です。
   */
  readonly paramKeys: readonly string[];

  /**
   * データ更新用のアクション関数です。未定義の場合は `undefined` となります。
   */
  readonly action: ActionFunction | undefined;

  /**
   * データの再読み込み動作を制御する確定的な判定関数です。定義がない場合はシステム既定の挙動を行う関数が割り当てられます。
   */
  readonly shouldReload: ShouldReloadFunction;

  /**
   * 画面描画に必要なデータを取得する関数です。未定義の場合は `undefined` となります。
   */
  readonly loader: LoaderFunction | undefined;

  /**
   * 表示対象となる React のコンポーネントです。未定義の場合は `undefined` となります。
   */
  readonly component: React.ComponentType<{}> | undefined;
};
