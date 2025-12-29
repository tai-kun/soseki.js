/**
 * オブジェクトにスタックトレースをキャプチャーします。
 *
 * @param targetObject スタックトレースのプロパティーを追加する対象のオブジェクトです。
 * @param constructorOpt スタックトレースの開始地点としてマークする関数です。
 */
export default function captureStackTrace(targetObject: object, constructorOpt: Function): void {
  // 実行環境（V8 エンジンなど）が Error.captureStackTrace をサポートしているか確認します。
  if ("captureStackTrace" in Error && typeof Error.captureStackTrace === "function") {
    Error.captureStackTrace(targetObject, constructorOpt);
  }
}
