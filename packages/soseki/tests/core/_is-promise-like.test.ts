import { describe, test } from "vitest";
import isPromiseLike from "../../src/core/_is-promise-like.js";

describe("値が PromiseLike である場合", () => {
  test("Promise インスタンスを渡したとき、 true を返す", ({ expect }) => {
    // Arrange
    const value = Promise.resolve("test");

    // Act
    const result = isPromiseLike(value);

    // Assert
    expect(result).toBe(true);
  });

  test("then メソッドを持つオブジェクトを渡したとき、 true を返す", ({ expect }) => {
    // Arrange
    const value = {
      then: () => {},
    };

    // Act
    const result = isPromiseLike(value);

    // Assert
    expect(result).toBe(true);
  });
});

describe("値が PromiseLike ではない場合", () => {
  test("null を渡したとき、 false を返す", ({ expect }) => {
    // Arrange
    const value = null;

    // Act
    const result = isPromiseLike(value);

    // Assert
    expect(result).toBe(false);
  });

  test("undefined を渡したとき、 false を返す", ({ expect }) => {
    // Arrange
    const value = undefined;

    // Act
    const result = isPromiseLike(value);

    // Assert
    expect(result).toBe(false);
  });

  test("then プロパティを持たないオブジェクトを渡したとき、 false を返す", ({ expect }) => {
    // Arrange
    const value = {
      other: "property",
    };

    // Act
    const result = isPromiseLike(value);

    // Assert
    expect(result).toBe(false);
  });

  test("then プロパティが関数ではないオブジェクトを渡したとき、 false を返す", ({ expect }) => {
    // Arrange
    const value = {
      then: "not a function",
    };

    // Act
    const result = isPromiseLike(value);

    // Assert
    expect(result).toBe(false);
  });

  test("プリミティブな数値を渡したとき、 false を返す", ({ expect }) => {
    // Arrange
    const value = 123;

    // Act
    const result = isPromiseLike(value);

    // Assert
    expect(result).toBe(false);
  });

  test("プリミティブな文字列を渡したとき、 false を返す", ({ expect }) => {
    // Arrange
    const value = "string";

    // Act
    const result = isPromiseLike(value);

    // Assert
    expect(result).toBe(false);
  });
});
