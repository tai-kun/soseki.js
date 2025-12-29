import RedirectResponse from "../core/redirect-response.js";

/**
 * 指定されたパスネームへのリダイレクトを表すレスポンスオブジェクトを生成します。
 *
 * アクションの中で、別のページへ遷移させるために使用されます。
 *
 * @param pathname リダイレクト先のパスネームです。
 * @returns 生成された `RedirectResponse` オブジェクトを返します。
 */
export default function redirect(pathname: string): RedirectResponse {
  return new RedirectResponse(pathname);
}
