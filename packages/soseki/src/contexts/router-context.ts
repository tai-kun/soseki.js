import * as React from "react";
import type { IReadonlyDataStore } from "../core/data-store.types.js";
import type { HistoryEntry } from "../core/expect-history-entry.js";
import type { IAction, ILoader } from "../core/route.types.js";
import type { NavigateArgs, SubmitArgs } from "../engines/engine.types.js";

export type RouterRef = Readonly<
  React.RefObject<{
    /**
     * フォームデータやクエリー パラメーターを送信します。
     *
     * @param args 送信内容と送信先を含む引数です。
     */
    readonly submit: (args: SubmitArgs) => void;

    /**
     * 指定されたパスへ遷移します。
     *
     * @param args 遷移先と遷移オプションを含む引数です。
     */
    readonly navigate: (args: NavigateArgs) => void;

    /**
     * 現在の履歴エントリー情報（ID、URL、インデックスなど）です。
     */
    readonly currentEntry: HistoryEntry;

    /**
     * 履歴 ID ごとに管理されているアクションデータのマップです。
     */
    readonly actionDataStore: IReadonlyDataStore<IAction>;

    /**
     * 履歴 ID ごとに管理されているローダーデータのマップです。
     */
    readonly loaderDataStore: IReadonlyDataStore<ILoader>;
  }>
>;

/**
 * ルーターコンテキストで共有される値の型定義です。
 */
export type RouterContextValue = {
  readonly routerRef: RouterRef;
  readonly subscribe: (onRouterChange: () => void) => () => void;
};

/**
 * ルーターの状態や操作関数をコンポーネントツリー全体で共有するための React コンテキストです。
 *
 * 初期値は `null` であり、通常は Provider を介して値が提供されます。
 */
const RouterContext = /*#__PURE__*/ React.createContext<RouterContextValue | null>(null);

export default RouterContext;
