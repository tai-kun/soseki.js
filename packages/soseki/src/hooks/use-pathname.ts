import useRouterContext from "./_use-router-context.js";

/**
 * 現在のルートにおける URL のパスネームを取得するためのカスタムフックです。
 *
 * @returns 現在のルートにおけるパスネームを表す文字列を返します。
 */
export default function usePathname(): string {
  return useRouterContext(router => router.currentEntry.url.pathname);
}
