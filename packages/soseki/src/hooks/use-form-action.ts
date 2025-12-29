import useRouteContext from "./_use-route-context.js";

/**
 * フォームの送信先となるアクション URL を取得するためのカスタムフックです。
 *
 * @returns 現在のルートコンテキストから抽出された URL パスを返します。
 */
export default function useFormAction(): string {
  const { urlPath } = useRouteContext();
  return urlPath;
}
