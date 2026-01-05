import { isPromiseLike } from "@tai-kun/is-promise-like";

declare global {
  /**
   * シングルトンインスタンスを管理するためのグローバルなキャッシュマップです。
   */
  var soseki__singleton: Map<unknown, any> | undefined;
}

/**
 * 指定されたキーに基づいて値を一意に保持するシングルトンパターンを提供します。
 *
 * 初回実行時に生成された値をキャッシュし、以降の呼び出しではその値を返します。
 *
 * @template T 生成される値の型です。
 * @param key インスタンスを識別するためのユニークなキーです。
 * @param fn インスタンスを生成するためのファクトリー関数です。
 * @returns キャッシュされた値、または非同期の場合はその解決値を返します。
 */
export default function singleton<T>(key: unknown, fn: (...args: any) => T): T | Awaited<T> {
  const cache = globalThis.soseki__singleton ||= new Map<unknown, any>();
  if (cache.has(key)) {
    return cache.get(key);
  }

  let returns = fn();
  if (isPromiseLike<T>(returns)) {
    const promise = (async () => {
      try {
        const value = await returns;
        cache.set(key, value);
        return value;
      } catch (ex) {
        // エラーが発生した場合はキャッシュを削除し、エラーを投げます。
        cache.delete(key);
        throw ex;
      }
    })();
    cache.set(key, promise);
  } else {
    cache.set(key, returns);
  }

  return cache.get(key);
}
