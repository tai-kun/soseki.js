import type { NinjaPromise } from "ninja-promise";
import * as React from "react";

import type { HistoryEntry } from "../core/expect-history-entry.js";
import type { HistoryEntryId } from "../core/history-entry-id-schema.js";
import type { ActionFunction, LoaderFunction } from "../core/route.types.js";
import type { IEngine } from "../engines/engine.types.js";

/**
 * ルーターの実体へのアクセスを提供する、読み取り専用の Ref オブジェクト型です。
 */
export type RouterRef = Readonly<
  React.RefObject<{
    /**
     * フォームデータやクエリーパラメーターをルーターに送信するための関数です。
     */
    readonly submit: (args: IEngine.SubmitArgs) => void;

    /**
     * URL 遷移や履歴スタックの相対移動をルーターに命令するための関数です。
     */
    readonly navigate: (args: IEngine.NavigateArgs) => void;

    /**
     * 現在ブラウザー上でアクティブになっている履歴エントリーの情報です。
     */
    readonly currentEntry: HistoryEntry;

    /**
     * 履歴エントリーの ID ごとにアクションの実行状態を管理するデータストアです。
     */
    readonly actionDataStore: ReadonlyMap<
      HistoryEntryId,
      ReadonlyMap<ActionFunction, NinjaPromise<unknown>>
    >;

    /**
     * 履歴エントリーの ID ごとにローダーの実行状態を管理するデータストアです。
     */
    readonly loaderDataStore: ReadonlyMap<
      HistoryEntryId,
      ReadonlyMap<LoaderFunction, NinjaPromise<unknown>>
    >;
  }>
>;

/**
 * `RouterContext` がコンポーネントツリーの配下に供給するオブジェクトの型定義です。
 */
export type RouterContextValue = {
  /**
   * ルーターの最新実体への参照を保持する Ref オブジェクトです。
   */
  readonly routerRef: RouterRef;

  /**
   * ルーターの状態変更を監視するための購読関数です。
   *
   * @param onRouterChange ルーターの内部状態が変化した際に実行されるコールバック関数です。
   * @returns 監視を安全に解除するためのクリーンアップ関数を返します。
   */
  readonly subscribe: (onRouterChange: () => void) => () => void;
};

/**
 * アプリケーションの最上位からルーターのグローバル状態を子コンポーネントへ一元的に伝播させるための React コンテキストです。
 *
 * パフォーマンス最適化のためにプロバイダー自体は基本的に更新されず、子コンポーネントは `subscribe` と `useSyncExternalStore`を使って必要な部分データだけを購読します。
 */
const RouterContext = /*#__PURE__*/ React.createContext<RouterContextValue | null>(null);

export default RouterContext;
