import * as React from "react";
import RouteContext from "../contexts/route-context.js";
import RouterContext, {
  type RouterContextValue,
  type RouterRef,
} from "../contexts/router-context.js";
import processRoutes from "../core/_process-routes.js";
import type { IDataStore } from "../core/data-store.types.js";
import type { HistoryEntry } from "../core/expect-history-entry.js";
import type { MatchedRoute } from "../core/match-routes.js";
import type { IAction, ILoader, RouteDefinition } from "../core/route.types.js";
import type { IEngine, RouterState, SubmitArgs } from "../engines/engine.types.js";
import type { NavigateArgs } from "../engines/engine.types.js";

/**
 * ComponentRenderer コンポーネントに渡されるプロパティーの型定義です。
 */
type ComponentRendererProps = {
  /**
   * 現在のコンテキストでレンダリングされる、マッチしたルート情報です。
   */
  route: MatchedRoute;

  /**
   * ネストされた下位のルート要素です。存在しない場合は null を指定します。
   */
  outlet: React.ReactElement<RouteRendererProps, typeof RouteRenderer> | null;
};

/**
 * 個別のルートコンポーネントをレンダリングし、ルートコンテキストを提供する内部コンポーネントです。
 */
function ComponentRenderer(props: ComponentRendererProps): React.JSX.Element | null {
  const {
    route: {
      path,
      index,
      params,
      urlPath,
      component: Component,
    },
    outlet,
  } = props;
  const context = {
    path,
    index,
    params,
    outlet,
    urlPath,
  };

  return (
    <RouteContext value={context}>
      {Component ? <Component /> : outlet}
    </RouteContext>
  );
}

/**
 * マッチしたルートを再帰的にレンダリングするためのプロパティーです。
 */
type RouteRendererProps = {
  /**
   * 現在のパスにマッチしたルートの配列です。
   */
  routes: readonly MatchedRoute[];

  /**
   * 現在レンダリング対象となっているルートのインデックス番号です。
   */
  index?: number;
};

/**
 * マッチしたルートの階層を順番にレンダリングする内部コンポーネントです。
 */
function RouteRenderer(props: RouteRendererProps): React.ReactElement {
  const {
    index = 0,
    routes,
  } = props;
  const route = routes[index]!;
  const outlet = index < routes.length - 1
    ? <RouteRenderer routes={routes} index={index + 1} />
    : null;

  return (
    <ComponentRenderer
      route={route}
      outlet={outlet}
    />
  );
}

/**
 * Router コンポーネントに渡されるプロパティーの型定義です。
 */
export type RouterProps = {
  /**
   * ルーティングのロジックを制御するエンジンインスタンスです。
   */
  engine: IEngine;

  /**
   * アプリケーションのルート定義の配列です。
   */
  routes: readonly RouteDefinition[];
};

/**
 * ルーティング機能を提供するメインのコンポーネントです。
 *
 * エンジンの管理、状態の同期、およびルートのレンダリングを担います。
 */
export default function Router(props: RouterProps) {
  const {
    engine,
    routes: routesProp,
  } = props;
  const routerRef = React.useRef({} as {
    submit(args: SubmitArgs): void;
    navigate(args: NavigateArgs): void;
    currentEntry: HistoryEntry;
    actionDataStore: IDataStore<IAction>;
    loaderDataStore: IDataStore<ILoader>;
  });
  const router = React.useMemo<{
    start(): () => void;
    context: RouterContextValue;
    getRoutes(): readonly MatchedRoute[] | undefined;
  }>(
    () => {
      const actionDataStore: IDataStore<IAction> = new Map();
      const loaderDataStore: IDataStore<ILoader> = new Map();
      const subscribers = new Set<() => void>();
      const routes = processRoutes(routesProp);
      let ac: AbortController | null = null;

      function getAbortSignal(): AbortSignal {
        return (ac ||= new AbortController()).signal;
      }

      const initialState = engine.init({
        routes,
        getSignal: getAbortSignal,
        loaderDataStore,
      });
      let currentRoutes = initialState?.routes;

      function updateRouter(newState?: RouterState | null) {
        if (newState !== undefined) {
          currentRoutes = newState?.routes;
        }
        if (newState) {
          routerRef.current.currentEntry = newState.entry;
        }

        // 登録されているすべてのサブスクライバーに通知します。
        subscribers.forEach(notify => notify());
      }

      function startRouterEngine() {
        const stop = engine.start({
          routes,
          update: updateRouter,
          getSignal: getAbortSignal,
          actionDataStore,
          loaderDataStore,
        });

        return function stopRouterEngine() {
          try {
            // エンジンの動作を停止します。
            stop?.();
          } finally {
            // 進行中のすべての非同期処理を中断します。
            try {
              ac?.abort();
            } catch {
            }

            // 中断後は次回の呼び出しに備えてコントローラーを破棄します。
            ac = null;
          }
        };
      }

      Object.assign<RouterRef["current"], RouterRef["current"]>(routerRef.current, {
        submit(args) {
          return engine.submit(args);
        },
        navigate(args) {
          return engine.navigate(args);
        },
        currentEntry: initialState?.entry!,
        actionDataStore,
        loaderDataStore,
      });

      return {
        start: startRouterEngine,
        context: {
          routerRef,
          subscribe(cb) {
            subscribers.add(cb);
            return () => {
              subscribers.delete(cb);
            };
          },
        },
        getRoutes() {
          return currentRoutes;
        },
      };
    },
    [
      engine,
      routesProp,
    ],
  );

  React.useEffect(router.start, [router]);

  const routes = React.useSyncExternalStore(router.context.subscribe, router.getRoutes);
  if (!routes) {
    return null;
  }

  return (
    <RouterContext value={router.context}>
      <RouteRenderer routes={routes.toReversed()} />
    </RouterContext>
  );
}
