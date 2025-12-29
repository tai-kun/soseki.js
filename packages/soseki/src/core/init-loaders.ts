import type { IDataMap } from "./data-map.types.js";
import type { IDataStore } from "./data-store.types.js";
import DeferredPromise from "./deferred-promise.js";
import type { HistoryEntry } from "./expect-history-entry.js";
import type { MatchedRoute } from "./match-routes.js";
import RouteRequest from "./route-request.js";
import type { ILoader } from "./route.types.js";

/**
 * ローダーの初期化に使用するパラメーターの型定義です。
 */
export type InitLoadersParams = {
  /**
   * マッチしたルート情報のリストです。パラメーターとデータ関数を含みます。
   */
  readonly routes: readonly Pick<MatchedRoute, "params" | "dataFuncs">[];

  /**
   * 履歴エントリーの情報です。 ID と URL を含みます。
   */
  readonly entry: Pick<HistoryEntry, "id" | "url">;

  /**
   * データを永続化するためのデータストアです。
   */
  readonly dataStore: IDataStore<ILoader>;

  /**
   * 非同期処理を中断するためのシグナルです。
   */
  readonly signal: AbortSignal;
};

/**
 * ルートに定義されたローダーを初期化し、実行します。
 *
 * 各ローダーの実行結果はデータストアに格納され、すべての実行開始を待機します。
 *
 * @param params ローダーの初期化に必要なパラメーターオブジェクトです。
 * @returns すべてのローダーの処理が開始（Settled）されるまで待機する Promise です。
 */
export default function initLoaders(params: InitLoadersParams): {
  (): Promise<void>;
} {
  const {
    entry,
    routes,
    signal,
    dataStore,
  } = params;
  const dataMap: IDataMap<ILoader> = new Map();
  const request = new RouteRequest("GET", entry.url, signal);
  // 各ルートおよびそのデータ関数に含まれるローダーを走査します。
  for (const route of routes) {
    for (const { loader } of route.dataFuncs) {
      if (!loader) {
        continue;
      }

      // ローダーの実行を遅延評価としてラップします。
      const data = DeferredPromise.try(function executeLoader() {
        return loader({
          params: route.params,
          request,
        });
      });
      // ローダーの結果を待機、エラーハンドリングする処理は、この結果を参照するコンポーネントに任せます。
      dataMap.set(loader, data);
    }
  }

  // 生成されたデータマップを履歴エントリーの ID に紐付けて保存します。
  dataStore.set(entry.id, dataMap);

  return async function waitForLoadersComplete() {
    // すべてのローダーの Promise が確定するまで待機します。
    await Promise.allSettled(dataMap.values());
  };
}
