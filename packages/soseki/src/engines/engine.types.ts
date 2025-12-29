import type { IDataStore } from "../core/data-store.types.js";
import type { HistoryEntry } from "../core/expect-history-entry.js";
import type { MatchedRoute } from "../core/match-routes.js";
import type { ReadonlyFormData } from "../core/readonly-form-data.types.js";
import type { ReadonlyURLSearchParams } from "../core/readonly-url.types.js";
import type { IAction, ILoader, Route } from "../core/route.types.js";

/**
 * ルーターの初期状態を生成する際に必要な引数の型定義です。
 */
export type InitEngineArgs = {
  /**
   * 前処理済みのルート定義の配列です。
   */
  readonly routes: readonly Route[];

  /**
   * 現在の非同期処理を中断するためのシグナルを取得する関数です。
   */
  readonly getSignal: () => AbortSignal;

  /**
   * ロケーション ID ごとに管理されているローダーデータのマップです。
   */
  readonly loaderDataStore: IDataStore<ILoader>;
};

/**
 * ルーターの現在の状態を表す型定義です。
 */
export type RouterState = {
  /**
   * 現在のロケーションエントリー情報です。
   */
  readonly entry: HistoryEntry;

  /**
   * 現在の URL にマッチしたルートの階層構造です。
   *
   * 最低でも 1 つのマッチしたルートが含まれるタプル形式となります。
   */
  readonly routes: readonly [MatchedRoute, ...MatchedRoute[]];
};

/**
 * ルーターの状態を更新するための関数インターフェースです。
 */
export interface IUpdateRouter {
  /**
   * システムの状態を更新します。
   */
  (): void;

  /**
   * 新しいルーターの状態を受け取り、システムの状態を更新します。
   *
   * @param state 新しいルーターの状態オブジェクトです。
   */
  (state: RouterState | null): void;
}

/**
 * ルーターエンジンを開始する際に必要な引数の型定義です。
 */
export type StartEngineArgs = {
  /**
   * 前処理済みのルート定義の配列です。
   */
  readonly routes: readonly Route[];

  /**
   * 状態を更新するためのセッター関数です。
   */
  readonly update: IUpdateRouter;

  /**
   * 現在の非同期処理を中断するためのシグナルを取得する関数です。
   */
  readonly getSignal: () => AbortSignal;

  /**
   * ロケーション ID ごとに管理されているアクションデータのマップです。
   */
  readonly actionDataStore: IDataStore<IAction>;

  /**
   * ロケーション ID ごとに管理されているローダーデータのマップです。
   */
  readonly loaderDataStore: IDataStore<ILoader>;
};

/**
 * エンジンの動作を停止するための関数インターフェースです。
 */
export interface IStopEngine {
  /**
   * 実行中のエンジンを停止し、イベントリスナーの解除などのクリーンアップを行います。
   */
  (): void;
}

/**
 * 送信処理に渡される引数の型定義です。
 */
export type SubmitArgs = {
  /**
   * 送信対象となるフォームデータです。
   */
  readonly target: ReadonlyFormData;

  /**
   * 送信先のパスです。
   */
  readonly action: string;

  /**
   * 実行するアクションの定義です。
   */
  readonly actionId: IAction | undefined;
} | {
  /**
   * 送信対象となる URL クエリーパラメーターです。
   */
  readonly target: ReadonlyURLSearchParams;

  /**
   * 送信先のパスです。
   */
  readonly action: string;

  /**
   * 履歴の追加方法を指定します。
   *
   * "replace" は現在のエントリーを置き換え、"push" は新しいエントリーを追加します。
   */
  readonly history: "replace" | "push";
};

/**
 * ナビゲーションの移動先を示す型定義です。
 *
 * パス文字列または詳細なパス情報のオブジェクトを受け取ります。
 */
export type NavigateTo = string | {
  /**
   * URL のパス名を表します。
   */
  readonly pathname?: string | undefined;

  /**
   * URL のクエリーパラメーターを表します。
   */
  readonly search?: string | undefined;

  /**
   * URL のハッシュフラグメントを表します。
   */
  readonly hash?: string | undefined;
};

/**
 * エンジンの遷移関数に渡される引数の型定義です。
 */
export type NavigateArgs = {
  /**
   * 遷移先です。
   */
  readonly to: NavigateTo;

  /**
   * 履歴の追加方法を指定します。
   *
   * "replace" は現在のエントリーを置き換え、"push" は新しいエントリーを追加します。
   */
  readonly history: "replace" | "push";
} | {
  /**
   * 履歴スタックの相対位置です。
   */
  readonly delta: number;
};

/**
 * ルーティングの基幹処理を担うエンジンのインターフェースです。
 */
export interface IEngine {
  /**
   * 与えられた引数に基づいて、ルーターを初期化します。
   *
   * @param args 状態生成に必要なルート情報やデータマップです。
   * @returns 生成されたルーター状態、またはマッチしなかった場合は `null` を返します。
   */
  init(args: InitEngineArgs): RouterState | null;

  /**
   * エンジンの動作を開始します。履歴の変化の監視などを開始します。
   *
   * @param args エンジンの開始に必要な設定とコールバック関数です。
   * @returns エンジンを停止するための関数を返します。停止処理が不要な場合は何も返しません。
   */
  start(args: StartEngineArgs): IStopEngine | void;

  /**
   * フォームデータやクエリーパラメーターを送信します。
   *
   * @param args 送信内容と送信先を含む引数です。
   */
  submit(args: SubmitArgs): void;

  /**
   * 指定されたパスへ遷移します。
   *
   * @param args 遷移先と遷移オプションを含む引数です。
   */
  navigate(args: NavigateArgs): void;
}
