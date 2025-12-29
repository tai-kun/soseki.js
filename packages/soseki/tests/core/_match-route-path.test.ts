import { describe, test } from "vitest";
import matchPath from "../../src/core/_match-route-path.js";

describe("パス名がルートのパターンに合致する場合", () => {
  test("パスから動的パラメーターが抽出され、MatchPathResult オブジェクトが返される", ({ expect }) => {
    // Arrange
    const route = {
      // path: "/users/:id",
      pathPattern: /^\/users\/([^/]+?)(?:\/)?$/i,
      paramKeys: ["id"],
    };
    const pathname = "/users/123";

    // Act
    const result = matchPath(route, pathname);

    // Assert
    expect(result).not.toBeNull();
    expect(result?.params).toStrictEqual({ id: "123" });
  });

  test("複数の動的パラメーターが含まれるとき、すべてのパラメーターが正しく抽出される", ({ expect }) => {
    // Arrange
    const route = {
      // path: "/posts/:year/:month",
      pathPattern: /^\/posts\/([^/]+?)\/([^/]+?)(?:\/)?$/i,
      paramKeys: ["year", "month"],
    };
    const pathname = "/posts/2025/12";

    // Act
    const result = matchPath(route, pathname);

    // Assert
    expect(result?.params).toStrictEqual({
      year: "2025",
      month: "12",
    });
  });

  test("パスに動的パラメーターが含まれないとき、空の params を持つオブジェクトが返される", ({ expect }) => {
    // Arrange
    const route = {
      // path: "/about",
      pathPattern: /^\/about(?:\/)?$/i,
      paramKeys: [],
    };
    const pathname = "/about";

    // Act
    const result = matchPath(route, pathname);

    // Assert
    expect(result?.params).toStrictEqual({});
  });
});

describe("パス名がルートのパターンに合致しない場合", () => {
  test("マッチングに失敗したとき、null が返される", ({ expect }) => {
    // Arrange
    const route = {
      // path: "/users/:id",
      pathPattern: /^\/users\/([^/]+?)(?:\/)?$/i,
      paramKeys: ["id"],
    };
    const pathname = "/other/123";

    // Act
    const result = matchPath(route, pathname);

    // Assert
    expect(result).toBeNull();
  });
});
