import * as React from "react";
import type { MatchedRoute } from "../core/match-routes.js";

/**
 * 各ルートのコンテキストで共有される値の型定義です。
 */
export type RouteContextValue = Pick<MatchedRoute, "path" | "index" | "params" | "urlPath"> & {
  /**
   * 子ルートを描画するための React 要素です。
   *
   * 子ルートが存在しない場合は `null` となります。
   */
  readonly outlet: React.ReactElement | null;
};

/**
 * 個別のルート情報やアウトレット（子ルートの挿入場所）を保持するための React コンテキストです。
 */
const RouteContext = /*#__PURE__*/ React.createContext<RouteContextValue | null>(null);

export default RouteContext;
