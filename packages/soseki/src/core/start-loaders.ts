import unreachable from "./_unreachable.js";
import type { IDataMap, IReadonlyDataMap } from "./data-map.types.js";
import type { IDataStore } from "./data-store.types.js";
import DeferredPromise from "./deferred-promise.js";
import { LoaderConditionError } from "./errors.js";
import type { HistoryEntry } from "./expect-history-entry.js";
import type { MatchedRoute } from "./match-routes.js";
import RouteRequest from "./route-request.js";
import type { IAction, ILoader, ShouldReloadArgs } from "./route.types.js";

/**
 * `startLoaders` 関数に渡すパラメーターの型定義です。
 */
export type StartLoadersParams =
  & {
    /**
     * 直前のルート情報の配列です。初回遷移時は `null` になります。
     */
    readonly prevRoutes: readonly Pick<MatchedRoute, "path" | "params">[] | null;

    /**
     * 現在の遷移先ルート情報の配列です。
     */
    readonly currentRoutes: readonly Pick<MatchedRoute, "path" | "params" | "dataFuncs">[];

    /**
     * 直前の履歴エントリー情報です。
     */
    readonly prevEntry: Pick<HistoryEntry, "id" | "url">;

    /**
     * 現在の履歴エントリー情報です。
     */
    readonly currentEntry: Pick<HistoryEntry, "id" | "url">;

    /**
     * アクションの実行結果を保持するデータストアーです。
     */
    readonly actionDataStore: IDataStore<IAction>;

    /**
     * ローダーの実行結果を保持するデータストアーです。
     */
    readonly loaderDataStore: IDataStore<ILoader>;

    /**
     * 非同期処理を中断するためのシグナルです。
     */
    readonly signal: AbortSignal;
  }
  & ({
    /**
     * 送信されたフォームデータです。
     */
    readonly formData: FormData;

    /**
     * アクションの実行結果を格納したマップです。
     */
    readonly actionResultMap: IReadonlyDataMap<IAction, unknown>;
  } | {
    /**
     * フォームデータが存在しないことを示します。
     */
    readonly formData?: undefined;

    /**
     * アクション結果マップが存在しないことを示します。
     */
    readonly actionResultMap?: undefined;
  });

/**
 * ルートに紐付くローダーの実行を開始し、データの同期や再読み込みの判定を行います。
 *
 * @param params ローダーの開始に必要なパラメーターオブジェクトです。
 * @returns すべてのローダーの完了を待機する非同期関数を返します。ローダーが不要な場合は `undefined` を返します。
 */
export default function startLoaders(params: StartLoadersParams): undefined | {
  /**
   * 実行中のすべてのローダーが完了するまで待機します。
   */
  (): Promise<void>;
} {
  const {
    signal,
    prevEntry,
    prevRoutes,
    currentEntry,
    currentRoutes,
    actionDataStore,
    loaderDataStore,
    ...options
  } = params;
  // ローダーの実行前にアクションが実行された場合、その情報を使ってローダーの処理を分岐させます。
  const actionContext = options.formData && {
    formData: options.formData,
    resultMap: options.actionResultMap,
  };
  // prevRoutes は「子ルート」->「親ルート」の順で並んでいるので、最初の要素がすべてのルートのパラメーターを保持しています。
  const prevParams = prevRoutes?.[0]?.params || {};
  const prevRoutePathSet: ReadonlySet<string> = new Set(prevRoutes?.map(r => r.path));
  const prevActionDataMap: IReadonlyDataMap<IAction> | undefined = actionDataStore
    .get(prevEntry.id);
  const prevLoaderDataMap: IReadonlyDataMap<ILoader> | undefined = loaderDataStore
    .get(prevEntry.id);
  const currentActionDataIncMap: IDataMap<IAction> = new Map();
  const currentLoaderDataIncMap: IDataMap<ILoader> = new Map();
  const request = new RouteRequest("GET", currentEntry.url, signal);

  // 各ルートおよびルートに定義されたデータ関数（action/loader）を走査します。
  for (const currentRoute of currentRoutes) {
    for (const { action, loader, shouldReload } of currentRoute.dataFuncs) {
      if (actionContext && action) {
        const prevActionData = prevActionDataMap?.get(action);
        if (prevActionData) {
          // 遷移前のアクションデータを引き継ぐことで、アクションの結果に応じて変更された描画内容を表示させ続けることができます。
          currentActionDataIncMap.set(action, prevActionData);
        }
      }

      if (!loader) {
        continue;
      }

      const prevLoaderData = prevLoaderDataMap?.get(loader);
      if (!prevLoaderData) {
        // 遷移前のローダーデータがない場合、新規ルートの描画と判定して、強制ロードします。
        // ローダーの実行を遅延評価としてラップします。
        const data = DeferredPromise.try(function executeLoader() {
          return loader({
            params: currentRoute.params,
            request,
          });
        });
        // ローダーの結果を待機、エラーハンドリングする処理は、この結果を参照するコンポーネントに任せます。
        currentLoaderDataIncMap.set(loader, data);
        continue;
      }

      // リロードすべきかどうかを判定します。
      const should = DeferredPromise.try(function executeShouldReload() {
        if (!actionContext) {
          // 通常の GET 遷移時の再読み込み判定引数を構築します。
          return shouldReload({
            prevUrl: prevEntry.url,
            currentUrl: currentEntry.url,
            prevParams,
            currentParams: currentRoute.params,
            triggerMethod: "GET",
            defaultShouldReload: !prevRoutePathSet.has(currentRoute.path),
          });
        }

        // 特定のアクションが実行された後の再読み込み判定引数を構築します。
        const {
          formData,
          resultMap,
        } = actionContext;
        let shouldArgs: ShouldReloadArgs = {
          prevUrl: prevEntry.url,
          formData,
          currentUrl: prevEntry.url,
          prevParams,
          currentParams: currentRoute.params,
          triggerMethod: "POST",
          defaultShouldReload: resultMap.size > 0,
        };
        if (action && resultMap.has(action)) {
          // アクションの結果があるときのみプロパティーを設定します。
          shouldArgs.actionResult = resultMap.get(action);
        }

        return shouldReload(shouldArgs);
      });

      let data: DeferredPromise<unknown>;
      switch (should.status) {
        case "pending": {
          // shouldReload は同期的に真偽値を返す必要があるので、pending 状態（つまり非同期）であってはいけません。
          const error = new LoaderConditionError(request.url.href, shouldReload, should);
          // エラーハンドリングは、このローダーデータを参照するコンポーネントに任せます。
          data = DeferredPromise.reject(error);
          break;
        }

        case "rejected":
          // エラーハンドリングは、このアクションデータを参照するコンポーネントに任せます。
          data = should;
          break;

        case "fulfilled": {
          const { value } = should;
          switch (value) {
            case true:
              // 条件を満たす場合のみ、ローダーの実行をスケジュールします。
              data = DeferredPromise.try(function executeLoader() {
                return loader({
                  params: currentRoute.params,
                  request,
                });
              });
              break;

            case false:
              // 再読み込みが不要な場合は、前回のデータを引き継ぎま
              data = prevLoaderData;
              break;

            default: {
              // shouldReload が真偽値を返さなかった場合、エラーとします。
              const error = new LoaderConditionError(request.url.href, shouldReload, value);
              // エラーハンドリングは、このローダーデータを参照するコンポーネントに任せます。
              data = DeferredPromise.reject(error);
            }
          }

          break;
        }

        default:
          unreachable(should);
      }

      currentLoaderDataIncMap.set(loader, data);
    }
  }

  // アクションデータの更新処理です。
  if (actionContext) {
    const dataMap = actionDataStore.get(currentEntry.id);
    if (dataMap) {
      for (const [action, data] of currentActionDataIncMap) {
        dataMap.set(action, data);
      }
    } else {
      actionDataStore.set(currentEntry.id, currentActionDataIncMap);
    }
  }

  // ローダーデータの更新処理です。
  const dataMap = loaderDataStore.get(currentEntry.id);
  if (dataMap) {
    for (const [loader, data] of currentLoaderDataIncMap) {
      dataMap.set(loader, data);
    }
  } else {
    loaderDataStore.set(currentEntry.id, currentLoaderDataIncMap);
  }

  return async function waitForLoadersComplete() {
    await Promise.allSettled(currentLoaderDataIncMap.values());
  };
}
