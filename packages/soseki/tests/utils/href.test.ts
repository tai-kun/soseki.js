import { describe, test } from "vitest";
import href from "../../src/utils/href.js";

describe("パスパラメーターが含まれるパスの場合", () => {
  test("単一のパラメーターを渡したとき、指定した位置に値が注入されたパスを返す", ({ expect }) => {
    // Arrange
    const path = "/users/:id";
    const params = { id: "123" };

    // Act
    const result = href(path, params);

    // Assert
    expect(result).toBe("/users/123");
  });

  test("複数のパラメーターを渡したとき、すべてのパラメーターが正しく注入されたパスを返す", ({ expect }) => {
    // Arrange
    const path = "/posts/:year/:month/:day";
    const params = { year: "2025", month: "12", day: "30" };

    // Act
    const result = href(path, params);

    // Assert
    expect(result).toBe("/posts/2025/12/30");
  });
});

describe("パスパラメーターが含まれないパスの場合", () => {
  test("空のパラメーターオブジェクトを渡したとき、元のパスをそのまま返す", ({ expect }) => {
    // Arrange
    const path = "/about";
    const params = {};

    // Act
    const result = href(path, params);

    // Assert
    expect(result).toBe("/about");
  });
});

describe("ワイルドカードが含まれるパスの場合", () => {
  test("ワイルドカード指定部分にパラメーターを注入したとき、正しく展開されたパスを返す", ({ expect }) => {
    // Arrange
    const path = "/files/*";
    const params = { "*": "path/to/file.txt" };

    // Act
    const result = href(path, params);

    // Assert
    expect(result).toBe("/files/path/to/file.txt");
  });
});
