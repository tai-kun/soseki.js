import captureStackTrace from "./_capture-stack-trace.js";
import { UnreachableError } from "./errors.js";

/**
 * 網羅性チェックを行うためのユーティリティー関数です。
 */
function unreachable(): never;

/**
 * 網羅性チェックを行うためのユーティリティー関数です。`never` 型の変数に予期せぬ値が代入された場合にエラーを投げます。
 *
 * @param value `never` 型の変数です。ここには到達しないはずの値が入ります。
 */
function unreachable(value: never): never;

function unreachable(...args: [never?]): never {
  const error = new UnreachableError(args);
  captureStackTrace(error, unreachable);
  throw error;
}

export default unreachable;
