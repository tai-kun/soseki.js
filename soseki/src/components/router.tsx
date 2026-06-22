import type { NinjaPromise } from "ninja-promise";
import * as React from "react";

import RouteContext from "../contexts/route-context.js";
import RouterContext, {
  type RouterRef,
  type RouterContextValue,
} from "../contexts/router-context.js";
import processRoutes from "../core/_process-routes.js";
import type { HistoryEntry } from "../core/expect-history-entry.js";
import type { HistoryEntryId } from "../core/history-entry-id-schema.js";
import type { MatchedRoute } from "../core/match-routes.js";
import type { ActionFunction, LoaderFunction } from "../core/route.types.js";
import type { IEngine, RouterState } from "../engines/engine.types.js";

/**
 * `ComponentRenderer` コンポーネントに渡されるプロパティーの型定義です。
 */
type ComponentRendererProps = {
  /**
   * レンダリング対象となる、マッチした単一のルート情報です。
   */
  route: MatchedRoute;

  /**
   * このルートの配下に描画されるべき子コンポーネントの要素です。
   */
  outlet: React.ReactElement<RouteRendererProps, typeof RouteRenderer> | null;
};

/**
 * マッチした個々のルートコンポーネントを、固有の `RouteContext` で包み込みながら再帰的にマウント・展開していくための内部レンダラーコンポーネントです。
 */
function ComponentRenderer(props: ComponentRendererProps): React.JSX.Element | null {
  const parentRoute = React.use(RouteContext);
  const { route, outlet } = props;
  const context = {
    ...route,
    outlet,
    // 親ルートのアクションとローダーを引き継ぐことで、`useActionData` と `useLoaderData` がデータを参照できようにします。
    action: route.action ?? parentRoute?.action,
    loader: route.loader ?? parentRoute?.loader,
  };
  const Comp = route.component;

  return (
    <RouteContext value={context}>{typeof Comp === "function" ? <Comp /> : outlet}</RouteContext>
  );
}

/**
 * `RouteRenderer` コンポーネントに渡されるプロパティーの型定義です。
 */
type RouteRendererProps = {
  /**
   * マッチしたルートの階層配列です。
   */
  routes: readonly MatchedRoute[];

  /**
   * 現在処理しているルート配列のインデックス（深さ）です。
   */
  index?: number;
};

/**
 * マッチしたルート配列を親から子の順番へと正しく巡回し、各階層を入れ子状の React エレメントツリーへと再帰的にビルドするコンポーネントです。
 */
function RouteRenderer(props: RouteRendererProps): React.ReactElement {
  const { index = 0, routes } = props;
  const route = routes[index]!;

  // 配列の終端に達していない場合はインデックスを 1 進めて自身を再帰的に呼び出し、ネストされる子要素を生成します。
  const outlet =
    index < routes.length - 1 ? <RouteRenderer routes={routes} index={index + 1} /> : null;

  return <ComponentRenderer route={route} outlet={outlet} />;
}

export type RouterRouteDefinitionObject = {
  readonly path: string;
  readonly index?: boolean | undefined;
  readonly action?: { (args: any): unknown } | undefined;
  readonly shouldReload?: { (args: any): boolean } | undefined;
  readonly loader?: { (args: any): unknown } | undefined;
  readonly component?: React.ComponentType<{}> | undefined;
};

export type RouterRouteDefinitionModule = {
  readonly path: string;
  readonly index?: boolean | undefined;
  readonly action?: { (args: any): unknown } | undefined;
  readonly shouldReload?: { (args: any): boolean } | undefined;
  readonly loader?: { (args: any): unknown } | undefined;
  readonly component?: React.ComponentType<{}> | undefined;
  readonly default?: React.ComponentType<{}> | undefined;
  get [Symbol.toStringTag](): string;
};

export type RouterRouteDefinition = RouterRouteDefinitionObject | RouterRouteDefinitionModule;

/**
 * `Router` コンポーネントに渡されるルートプロパティーの型定義です。
 */
export type RouterProps = {
  /**
   * プラグイン形式で差し込まれる、ルーティングの実装です。
   */
  engine: IEngine;

  /**
   * ユーザーがアプリケーションに定義したルート定義の配列です。
   */
  routes: readonly RouterRouteDefinition[];
};

/**
 * 宣言的なルート定義と、命令的なルーティング実行エンジンを仲介・統合し、アプリケーションの最上位でルーティングのライフサイクルと状態管理を司るプロバイダーコンポーネントです。
 */
export default function Router(props: RouterProps) {
  const { engine, routes: routesProp } = props;

  // レンダリングを跨いで常に同一参照を維持し、かつ子コンポーネントから不要な再レンダリングなしでメソッドを叩けるように、ルーターコアの外部参照実体を useRef で永続管理します。
  const routerRef = React.useRef(
    {} as {
      submit(args: IEngine.SubmitArgs): void;
      navigate(args: IEngine.NavigateArgs): void;
      currentEntry: HistoryEntry;
      actionDataStore: Map<HistoryEntryId, Map<ActionFunction, NinjaPromise<unknown>>>;
      loaderDataStore: Map<HistoryEntryId, Map<LoaderFunction, NinjaPromise<unknown>>>;
    },
  );

  // エンジン、ストア、イベント購読メカニズムのセットアップを一元化し、useMemo でインスタンス化します。
  const router = React.useMemo<{
    readonly start: () => () => void;
    readonly context: RouterContextValue;
    readonly getRoutes: () => readonly MatchedRoute[] | undefined;
  }>(() => {
    const actionDataStore = new Map<HistoryEntryId, Map<ActionFunction, NinjaPromise<unknown>>>();
    const loaderDataStore = new Map<HistoryEntryId, Map<LoaderFunction, NinjaPromise<unknown>>>();
    const subscribers = new Set<() => void>();
    const routes = processRoutes(routesProp);
    let ac: AbortController | null = null;

    /**
     * 現在のフェーズで有効な、シングルトン構造の中断シグナルをオンデマンドで生成・回収します。
     */
    function getAbortSignal(): AbortSignal {
      return (ac ||= new AbortController()).signal;
    }

    // エンジンを初期化し、初期ロード時のマッチングルートおよび解決済みのデータマップを取得・登録します。
    const initialState = engine.init({
      routes,
      getSignal: getAbortSignal,
      loaderDataStore,
    });
    let currentRoutes = initialState?.routes;

    /**
     * エンジン内部での遷移確定時に、状態を React 側へ通知・マージするための状態更新関数です。
     */
    function updateRouter(newState?: RouterState | null) {
      if (newState !== undefined) {
        currentRoutes = newState?.routes;
      }
      if (newState) {
        routerRef.current.currentEntry = newState.entry;
      }

      // 状態変更の発生を、React の useSyncExternalStore などのすべての購読者に一斉通知して再描画を促します。
      subscribers.forEach((notify) => notify());
    }

    /**
     * エンジンによるイベントのリアルタイム監視を開始するトリガー関数です。
     */
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
          if (typeof stop === "function") {
            stop();
          }
        } finally {
          try {
            ac?.abort();
          } catch {}
          ac = null;
        }
      };
    }

    // 作成した各種ストアや命令型メソッドの参照を、永続化 Ref オブジェクトへと安全にマージします。
    Object.assign<RouterRef["current"], RouterRef["current"]>(routerRef.current, {
      submit(args) {
        return engine.submit(args);
      },
      navigate(args) {
        return engine.navigate(args);
      },
      currentEntry: initialState?.entry as HistoryEntry,
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
  }, [engine, routesProp]);

  // コンポーネントのマウント時にルーターエンジンを始動させ、アンマウント時には自動的に破棄タスクを連動させます。
  React.useEffect(() => router.start(), [router]);

  // マッチしたルート階層配列をリアクティブに常時監視します。
  const routes = React.useSyncExternalStore(router.context.subscribe, router.getRoutes);

  // 有効なルートマッチングがない場合は何も描画しません。
  if (!routes) {
    // TODO(tai-kun): 404 Not Found ページを表示できるようにします。
    return null;
  }

  return (
    <RouterContext value={router.context}>
      {/* マッチルート配列は詳細度の高い「子 -> 親」の順で並んでいるため、React のネストレイアウト構造（親の中に子を入れる）に適合させるために `.toReversed()` で「親 -> 子」の順に反転させてからレンダラーへ投入します。*/}
      <RouteRenderer routes={routes.toReversed()} />
    </RouterContext>
  );
}
