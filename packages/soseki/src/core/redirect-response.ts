import encodePathname from "./_encode-pathname.js";

/**
 * リダイレクトの識別子として使用されるユニークなシンボルです。
 */
declare const ID: unique symbol;

/**
 * リダイレクトレスポンスを表現するクラスです。
 *
 * 指定されたパス名をエンコードして保持します。
 */
export default class RedirectResponse {
  /**
   * クラスを識別するためのユニークな ID です。
   *
   * @internal
   */
  // @ts-expect-error
  public readonly ID: typeof ID;

  /**
   * エンコード済みのリダイレクト先パス名です。
   */
  public readonly pathname: string;

  /**
   * RedirectResponse クラスの新しいインスタンスを初期化します。
   *
   * @param pathname リダイレクト先のパス名です。
   */
  public constructor(pathname: string) {
    // パス名を適切な形式にエンコードして格納します。
    this.pathname = encodePathname(pathname);
  }
}
