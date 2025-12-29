/**
 * **`ReadonlyFormData`** インターフェースは、フォームフィールドとその値のセットをキーと値のペアで構築する方法を提供します。
 *
 * 構築したデータは、`fetch()`、`XMLHttpRequest.send()`、または `navigator.sendBeacon()` メソッドを使用して送信できます。
 *
 * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/FormData)
 */
export interface ReadonlyFormData {
  /**
   * ReadonlyFormData インターフェースの **`get()`** メソッドは、`FormData` オブジェクト内にある指定したキーに関連付けられた最初の値を返します。
   *
   * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/FormData/get)
   */
  get(name: string): FormDataEntryValue | null;

  /**
   * ReadonlyFormData インターフェースの **`getAll()`** メソッドは、`FormData` オブジェクト内にある指定したキーに関連付けられたすべての値を返します。
   *
   * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/FormData/getAll)
   */
  getAll(name: string): FormDataEntryValue[];

  /**
   * ReadonlyFormData インターフェースの **`has()`** メソッドは、`FormData` オブジェクトに特定のキーが含まれているかどうかを返します。
   *
   * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/FormData/has)
   */
  has(name: string): boolean;

  /**
   * FormData オブジェクトに含まれるすべてのキーと値のペアに対して、指定されたコールバック関数を一度ずつ実行します。
   */
  forEach(
    callbackfn: (value: FormDataEntryValue, key: string, parent: ReadonlyFormData) => void,
    thisArg?: any,
  ): void;

  // /**
  //  * ReadonlyFormData インターフェースの **`entries()`** メソッドは、このオブジェクトに含まれるすべてのキーと値のペアを順に走査するためのイテレーターを返します。
  //  *
  //  * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/FormData/entries)
  //  */
  // entries(): IterableIterator<[string, FormDataEntryValue]>;

  // /**
  //  * ReadonlyFormData インターフェースの **`keys()`** メソッドは、このオブジェクトに含まれるすべてのキー（name）を順に走査するためのイテレーターを返します。
  //  *
  //  * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/FormData/keys)
  //  */
  // keys(): IterableIterator<string>;

  // /**
  //  * ReadonlyFormData インターフェースの **`values()`** メソッドは、このオブジェクトに含まれるすべての値を順に走査するためのイテレーターを返します。
  //  *
  //  * [MDN リファレンス](https://developer.mozilla.org/docs/Web/API/FormData/values)
  //  */
  // values(): IterableIterator<FormDataEntryValue>;

  // /**
  //  * FormData オブジェクトのデフォルトのイテレーターです。これにより `for...of` ループで直接 `entries()` と同様の挙動（キーと値のペアの取得）が可能になります。
  //  */
  // [Symbol.iterator](): IterableIterator<[string, FormDataEntryValue]>;
}
