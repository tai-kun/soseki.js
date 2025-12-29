import { describe, test } from "vitest";
import isError from "../../src/core/_is-error.js";

describe("Error オブジェクトの判定", () => {
  test("Error インスタンスを渡したとき、true になる", ({ expect }) => {
    // Arrange
    const input = new Error("test error");

    // Act
    const result = isError(input);

    // Assert
    expect(result).toBe(true);
  });

  test("Error を継承したクラスのインスタンスを渡したとき、true になる", ({ expect }) => {
    // Arrange
    class CustomError extends Error {}
    const input = new CustomError("custom error");

    // Act
    const result = isError(input);

    // Assert
    expect(result).toBe(true);
  });
});

// describe("Error に類似したオブジェクトの判定", () => {
//   test("name と message を持つプレーンなオブジェクトを渡したとき、true になる", ({ expect }) => {
//     // Arrange
//     const input = { name: "CustomError", message: "something went wrong" };

//     // Act
//     const result = isError(input);

//     // Assert
//     expect(result).toBe(true);
//   });
// });

describe("Error ではない値の判定", () => {
  test("null を渡したとき、false になる", ({ expect }) => {
    // Arrange
    const input = null;

    // Act
    const result = isError(input);

    // Assert
    expect(result).toBe(false);
  });

  test("undefined を渡したとき、false になる", ({ expect }) => {
    // Arrange
    const input = undefined;

    // Act
    const result = isError(input);

    // Assert
    expect(result).toBe(false);
  });

  test("文字列を渡したとき、false になる", ({ expect }) => {
    // Arrange
    const input = "some error message";

    // Act
    const result = isError(input);

    // Assert
    expect(result).toBe(false);
  });

  test("name のみが定義されたオブジェクトを渡したとき、false になる", ({ expect }) => {
    // Arrange
    const input = { name: "Error" };

    // Act
    const result = isError(input);

    // Assert
    expect(result).toBe(false);
  });

  test("message のみが定義されたオブジェクトを渡したとき、false になる", ({ expect }) => {
    // Arrange
    const input = { message: "error occurred" };

    // Act
    const result = isError(input);

    // Assert
    expect(result).toBe(false);
  });

  test("name が string ではないオブジェクトを渡したとき、false になる", ({ expect }) => {
    // Arrange
    const input = { name: 123, message: "error" };

    // Act
    const result = isError(input);

    // Assert
    expect(result).toBe(false);
  });
});
