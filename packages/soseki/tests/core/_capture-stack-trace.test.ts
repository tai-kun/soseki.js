import { test, vi } from "vitest";
import captureStackTrace from "../../src/core/_capture-stack-trace.js";

test("Error.captureStackTrace が定義されている環境で実行したとき、対象のオブジェクトにスタックトレースが設定される", ({ expect }) => {
  // Arrange
  const targetObject = {};
  const constructorOpt = () => {};
  // @ts-expect-error グローバルの型系義に captureStackTrace メソッドがない
  const mockCapture = vi.spyOn(Error, "captureStackTrace");

  try {
    // Act
    captureStackTrace(targetObject, constructorOpt);

    // Assert
    expect(mockCapture).toHaveBeenCalledWith(targetObject, constructorOpt);
  } finally {
    mockCapture.mockRestore();
  }
});

test("Error.captureStackTrace が未定義の環境で実行したとき、エラーを投げずに正常終了する", ({ expect }) => {
  // Arrange
  const targetObject = {};
  const constructorOpt = () => {};

  // Error.captureStackTrace を一時的に削除して、非サポート環境をシミュレートする
  // @ts-expect-error グローバルの型系義に captureStackTrace メソッドがない
  const originalCaptureStackTrace = Error.captureStackTrace;
  // @ts-expect-error: テストのためにプロパティを削除する
  delete Error.captureStackTrace;

  try {
    // Act & Assert
    // 例外が発生せず、undefined が返る（void 関数の正常終了）ことを確認する
    expect(() => {
      captureStackTrace(targetObject, constructorOpt);
    })
      .not
      .toThrow();
  } finally {
    // 環境を元に戻す
    // @ts-expect-error グローバルの型系義に captureStackTrace メソッドがない
    Error.captureStackTrace = originalCaptureStackTrace;
  }
});
