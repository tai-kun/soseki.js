/**
 * 連続するスラッシュ（/）にマッチする正規表現です。
 */
const MULTI_SLASH = /\/\/+/gu;

/**
 * 与えられたパス名を URL エンコードし、正規化された形式で返します。
 *
 * エンコードの必要がある部分のみをエンコードします。
 *
 * @param pathname エンコード対象となるパス名の文字列です。
 * @returns 正規化およびエンコードされたパス名の文字列です。
 */
export default function encodePathname(pathname: string): string {
  const u = new URL("x://y" + ("/" + pathname).replace(MULTI_SLASH, "/"));
  return u.pathname;
}
