import actionIdRegistry from "./_action-id-registry.js";
import unreachable from "./_unreachable.js";
import { ACTION_ID_FORM_DATA_NAME } from "./constants.js";
import type { IDataMap } from "./data-map.types.js";
import type { IDataStore } from "./data-store.types.js";
import DeferredPromise from "./deferred-promise.js";
import { ActionConditionError, ActionExecutionError, MultipleRedirectError } from "./errors.js";
import type { HistoryEntry } from "./expect-history-entry.js";
import type { MatchedRoute } from "./match-routes.js";
import type { ReadonlyFormData } from "./readonly-form-data.types.js";
import RedirectResponse from "./redirect-response.js";
import RouteRequest from "./route-request.js";
import type { IAction } from "./route.types.js";

/**
 * アクションの開始に使用するパラメーターの型定義です。
 */
export type StartActionsParams = {
  /**
   * マッチしたルート情報のリストです。パラメーターとデータ関数を含みます。
   */
  readonly routes: readonly Pick<MatchedRoute, "params" | "urlPath" | "dataFuncs">[];

  /**
   * 履歴エントリーの情報です。 ID と URL を含みます。
   */
  readonly entry: Pick<HistoryEntry, "id" | "url">;

  /**
   * フォームから送信された読み取り専用のデータです。
   */
  readonly formData: ReadonlyFormData;

  /**
   * アクションの結果を保持するためのデータストアです。
   */
  readonly dataStore: IDataStore<IAction>;

  /**
   * 非同期処理を中断するためのシグナルです。
   */
  readonly signal: AbortSignal;
};

/**
 * アクションの実行結果を表す型定義です。
 */
export type ActionsResult = {
  /**
   * リダイレクトが必要な場合のパス名です。リダイレクトが発生しない場合は undefined となります。
   */
  redirect: string | undefined;

  /**
   * 各アクションと実行結果を紐付けたマップです。
   */
  resultMap: ReadonlyMap<IAction, unknown>;
};

/**
 * ルートに定義されたアクションの実行を開始します。
 *
 * 条件に合致するアクションが存在する場合、それらを待機するための非同期関数を返します。
 *
 * @param params アクションの開始に必要なパラメーターオブジェクトです。
 * @returns アクションの完了を待機するための関数です。実行すべきアクションがない場合は undefined を返します。
 */
export default function startActions(params: StartActionsParams): undefined | {
  /**
   * アクションの完了を待機し、結果を集約して返す非同期関数です。
   *
   * @returns アクションの結果（リダイレクト先や実行結果のマップ）を返します。
   */
  (): Promise<ActionsResult>;
} {
  const {
    entry,
    routes,
    signal,
    formData,
    dataStore,
  } = params;
  const request = new RouteRequest("POST", entry.url, signal, formData);
  const redirects: string[] = [];
  const dataIncMap: IDataMap<IAction> = new Map();
  let encountered = false;
  // ルートを走査し、実行すべきアクションを特定します。
  for (const route of routes) {
    for (const { action, shouldAction } of route.dataFuncs) {
      if (!action) {
        continue;
      }

      // アクションを持つルートが見つかったため、フラグを立てます。
      encountered = true;

      // アクションを実行すべきかどうかを判定します。
      const should = DeferredPromise.try(function executeShouldAction() {
        return shouldAction({
          params: route.params,
          request,
          defaultShouldAction: formData.has(ACTION_ID_FORM_DATA_NAME)
            ? formData.get(ACTION_ID_FORM_DATA_NAME) === actionIdRegistry.get(action)
            : true,
        });
      });

      let data: DeferredPromise<unknown>;
      switch (should.status) {
        case "pending": {
          // shouldAction は同期的に真偽値を返す必要があるので、pending 状態（つまり非同期）であってはいけません。
          const error = new ActionConditionError(request.url.href, shouldAction, should);
          // エラーハンドリングは、このアクションデータを参照するコンポーネントに任せます。
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
            case true: {
              // 条件を満たす場合のみ、アクションの実行をスケジュールします。
              const clientData = DeferredPromise.try(function executeAction() {
                return action({
                  params: route.params,
                  request,
                });
              });
              switch (clientData.status) {
                case "pending": {
                  // 特定の返り値を別の値に入れ替えるために中継 DeferredPromise をアクションデータとします。
                  const proxy = DeferredPromise.withResolvers();
                  data = proxy.promise;
                  (async () => {
                    try {
                      const value = await clientData;
                      switch (true) {
                        case value instanceof RedirectResponse:
                          // リダイレクトを指示する返り値を記録し、コンポーネントが参照するデータを undefined に置き換えます。
                          redirects.push(value.pathname);
                          proxy.resolve(undefined);
                          break;

                        default:
                          proxy.resolve(value);
                      }
                    } catch (ex) {
                      proxy.reject(ex);
                    }
                  })();
                  break;
                }

                case "rejected":
                  // エラーハンドリングは、このアクションデータを参照するコンポーネントに任せます。
                  data = clientData;
                  break;

                case "fulfilled": {
                  const { value } = clientData;
                  switch (true) {
                    case value instanceof RedirectResponse:
                      // リダイレクトを指示する返り値を記録し、コンポーネントが参照するデータを undefined に置き換えます。
                      redirects.push(value.pathname);
                      data = DeferredPromise.resolve(undefined);
                      break;

                    default:
                      data = clientData;
                  }

                  break;
                }

                default:
                  unreachable(clientData);
              }

              break;
            }

            case false:
              // 条件を満たさない場合はアクションの実行をスキップします。
              continue;

            default: {
              // shouldAction が真偽値を返さなかった場合、エラーとします。
              const error = new ActionConditionError(request.url.href, shouldAction, value);
              // エラーハンドリングは、このアクションデータを参照するコンポーネントに任せます。
              data = DeferredPromise.reject(error);
            }
          }

          break;
        }

        default:
          unreachable(should);
      }

      dataIncMap.set(action, data);
    }

    // アクションを持つルートが見つかった時点で走査を終了します。
    if (encountered) {
      break;
    }
  }

  if (!encountered) {
    // 実行されたアクションが無い場合は、これ以上することは何もありません。
    return;
  }

  if (dataIncMap.size <= 0) {
    return async () => ({
      redirect: undefined,
      resultMap: new Map(),
    });
  }

  // 特定されたアクションのマップをデータストアに格納します。
  const dataMap = dataStore.get(entry.id);
  if (dataMap) {
    for (const [action, data] of dataIncMap) {
      dataMap.set(action, data);
    }
  } else {
    dataStore.set(entry.id, dataIncMap);
  }

  return async function waitForActionsComplete() {
    const resultMap: IDataMap<IAction, unknown> = new Map();
    const promises: Promise<void>[] = [];
    const rejected: { action: IAction; reason: unknown }[] = [];
    for (const [action, data] of dataIncMap) {
      const promise = (async () => {
        try {
          const value = await data;
          resultMap.set(action, value);
        } catch (ex) {
          rejected.push({
            action,
            reason: ex,
          });
        }
      })();
      promises.push(promise);
    }

    // すべてのアクションの完了を待ちます。
    await Promise.all(promises);

    // エラーが発生したアクションがある場合は例外を投げます。
    if (rejected.length > 0) {
      throw new ActionExecutionError(request.url.href, rejected);
    }

    // 複数のアクションからリダイレクトが返された場合は不正な状態としてエラーを投げます。
    if (redirects.length > 1) {
      throw new MultipleRedirectError(request.url.href, redirects);
    }

    return {
      redirect: redirects[0],
      resultMap,
    };
  };
}
