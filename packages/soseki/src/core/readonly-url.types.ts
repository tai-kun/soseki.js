/**
 * **`ReadonlyURL`** インターフェースは、URL の解析、構築、正規化、およびエンコードを行うために使用されます。
 *
 * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/URL)
 */
export interface ReadonlyURL {
  /**
   * ReadonlyURL インターフェースの **`hash`** プロパティーは、"#" とそれに続く ReadonlyURL のフラグメント識別子を含む文字列です。
   *
   * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/URL/hash)
   */
  readonly hash: string;

  /**
   * ReadonlyURL インターフェースの **`host`** プロパティーは、ホスト（`ReadonlyURL.hostname`）と、URL のポートが空でない場合は ":" に続くポート（`ReadonlyURL.port`）を含む文字列です。
   *
   * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/URL/host)
   */
  readonly host: string;

  /**
   * ReadonlyURL インターフェースの **`hostname`** プロパティーは、URL のドメイン名または IP アドレスを含む文字列です。
   *
   * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/URL/hostname)
   */
  readonly hostname: string;

  /**
   * ReadonlyURL インターフェースの **`href`** プロパティーは、URL 全体を含む文字列です。
   *
   * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/URL/href)
   */
  readonly href: string;

  /**
   * ReadonlyURL インターフェースの **`toString()`** メソッドは、URL をシリアライズした文字列を返します。実際には `ReadonlyURL.href` と同じ値を返します。
   *
   * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/URL/toString)
   */
  toString(): string;

  /**
   * ReadonlyURL インターフェースの **`origin`** プロパティーは、対象となる ReadonlyURL のオリジンを Unicode 形式でシリアライズした文字列を返します。
   *
   * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/URL/origin)
   */
  readonly origin: string;

  /**
   * ReadonlyURL インターフェースの **`password`** プロパティーは、URL のパスワード成分を含む文字列です。
   *
   * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/URL/password)
   */
  readonly password: string;

  /**
   * ReadonlyURL インターフェースの **`pathname`** プロパティーは、階層構造における場所を表します。
   *
   * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/URL/pathname)
   */
  readonly pathname: string;

  /**
   * ReadonlyURL インターフェースの **`port`** プロパティーは、URL のポート番号を含む文字列です。
   *
   * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/URL/port)
   */
  readonly port: string;

  /**
   * ReadonlyURL インターフェースの **`protocol`** プロパティーは、末尾の ":" を含む、URL のプロトコルまたはスキームを示す文字列です。
   *
   * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/URL/protocol)
   */
  readonly protocol: string;

  /**
   * ReadonlyURL インターフェースの **`search`** プロパティーは、検索文字列（またはクエリー文字列）です。これは、"?" とそれに続く ReadonlyURL のパラメーターを含む文字列です。
   *
   * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/URL/search)
   */
  readonly search: string;

  /**
   * ReadonlyURL インターフェースの **`searchParams`** プロパティーは、URL に含まれるクエリー引数をデコードして扱うための `ReadonlyURLSearchParams` オブジェクトへのアクセスを提供します。
   *
   * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/URL/searchParams)
   */
  readonly searchParams: ReadonlyURLSearchParams;

  /**
   * ReadonlyURL インターフェースの **`username`** プロパティーは、URL のユーザー名成分を含む文字列です。
   *
   * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/URL/username)
   */
  readonly username: string;

  /**
   * ReadonlyURL インターフェースの **`toJSON()`** メソッドは、URL をシリアライズした文字列を返します。実際には `ReadonlyURL.href` と同じ値を返します。
   *
   * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/URL/toJSON)
   */
  toJSON(): string;
}

/**
 * **`ReadonlyURLSearchParams`** インターフェースは、URLのクエリー文字列を操作するための便利なメソッドを定義します。
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams)
 */
export interface ReadonlyURLSearchParams {
  /**
   * ReadonlyURLSearchParams インターフェースの **`size`** プロパティーは、検索パラメーターのエントリーの総数を示します。
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/size)
   */
  readonly size: number;

  /**
   * ReadonlyURLSearchParams インターフェースの **`get()`** メソッドは、指定された検索パラメーターに関連付けられた最初の値を返します。
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/get)
   */
  get(name: string): string | null;

  /**
   * ReadonlyURLSearchParams インターフェースの **`getAll()`** メソッドは、指定された検索パラメーターに関連付けられたすべての値を配列として返します。
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/getAll)
   */
  getAll(name: string): string[];

  /**
   * ReadonlyURLSearchParams インターフェースの **`has()`** メソッドは、指定されたパラメーターが検索パラメーターに含まれているかどうかを示す論理値を返します。
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/has)
   */
  has(name: string, value?: string): boolean;

  /**
   * ReadonlyURLSearchParams インターフェースの **`toString()`** メソッドは、URL で使用できるクエリー文字列（先頭の "?" を除く）を返します。
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/toString)
   */
  toString(): string;

  /**
   * ReadonlyURLSearchParams インターフェースの **`forEach()`** メソッドは、このオブジェクト内に存在する各値に対して、渡されたコールバック関数を一度ずつ実行します。
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/forEach)
   */
  forEach(
    callbackfn: (value: string, key: string, parent: ReadonlyURLSearchParams) => void,
    thisArg?: any,
  ): void;
}
