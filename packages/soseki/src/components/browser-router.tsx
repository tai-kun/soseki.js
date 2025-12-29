import useSingleton from "../core/_use-singleton.js";
import type { RouteDefinition } from "../core/route.types.js";
import NavigationApiEngine from "../engines/navigation-api-engine.js";
import Router from "./router.jsx";

/**
 * BrowserRouter コンポーネントに渡されるプロパティーの型定義です。
 */
export type BrowserRouterProps = {
  /**
   * アプリケーション全体のルート定義を格納した配列です。
   */
  routes: readonly RouteDefinition[];
};

/**
 * ブラウザー標準の Navigation API を使用してルーティングを行うためのコンポーネントです。
 *
 * `NavigationApiEngine` のインスタンスをシングルトンとして保持し、ルーターの基盤を提供します。
 */
export default function BrowserRouter(props: BrowserRouterProps): React.ReactElement {
  const { routes } = props;
  const engine = useSingleton(() => new NavigationApiEngine());

  return (
    <Router
      engine={engine}
      routes={routes}
    />
  );
}
