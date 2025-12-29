import { describe, test } from "vitest";
import compareRoutePaths from "../../src/core/_compare-route-paths.js";

describe("静的なパスと動的なパスの比較", () => {
  test("静的なパスが、パラメーターを含むパスより優先されるとき、戻り値が負数になる", ({ expect }) => {
    // Arrange
    const staticPath = "/books/horror";
    const paramPath = "/books/:genre";

    // Act
    const result = compareRoutePaths(staticPath, paramPath);

    // Assert
    expect(result).toBeLessThan(0);
  });

  test("パラメーターを含むパスが、ワイルドカードを含むパスより優先されるとき、戻り値が負数になる", ({ expect }) => {
    // Arrange
    const paramPath = "/books/:genre";
    const wildcardPath = "/*";

    // Act
    const result = compareRoutePaths(paramPath, wildcardPath);

    // Assert
    expect(result).toBeLessThan(0);
  });
});

describe("パラメーターの具体性による比較", () => {
  test("必須パラメーターが、任意パラメーターより優先されるとき、戻り値が負数になる", ({ expect }) => {
    // Arrange
    const requiredParam = "/books/:genre";
    const optionalParam = "/books/:genre?";

    // Act
    const result = compareRoutePaths(requiredParam, optionalParam);

    // Assert
    expect(result).toBeLessThan(0);
  });

  test("任意パラメーターが、ワイルドカードより優先されるとき、戻り値が負数になる", ({ expect }) => {
    // Arrange
    const optionalParam = "/users/:id?";
    const wildcard = "/users/*";

    // Act
    const result = compareRoutePaths(optionalParam, wildcard);

    // Assert
    expect(result).toBeLessThan(0);
  });
});

describe("パスの深さによる比較", () => {
  test("より深い階層を持つ静的パスが、浅い静的パスより優先されるとき、戻り値が負数になる", ({ expect }) => {
    // Arrange
    const deepPath = "/books/horror/goosebumps";
    const shallowPath = "/books/horror";

    // Act
    const result = compareRoutePaths(deepPath, shallowPath);

    // Assert
    expect(result).toBeLessThan(0);
  });

  test("同じ深さでスコアが等しいとき、文字列の辞書順で比較される", ({ expect }) => {
    // Arrange
    const pathA = "/books/apple";
    const pathB = "/books/banana";

    // Act
    const result = compareRoutePaths(pathA, pathB);

    // Assert
    // 'apple' は 'banana' より辞書順で前のため、負数を期待する
    expect(result).toBeLessThan(0);
  });
});

describe("複雑なルート群のソート結果の検証", () => {
  test("複数のルートをソートしたとき、仕様で定義された優先順位に従って並ぶ", ({ expect }) => {
    // Arrange
    const routes = [
      "/*",
      "/books/:genre",
      "/books/horror",
      "/books/:genre/:title?",
      "/users/*?",
      "/books/horror/goosebumps",
    ];

    // Act
    const sorted = [...routes].sort(compareRoutePaths);

    // Assert
    const expected = [
      "/books/horror/goosebumps", // 最も深い静的パス
      "/books/horror", // 静的パス
      "/books/:genre/:title?", // 深いパラメーター
      "/books/:genre", // パラメーター
      "/users/*?", // 任意ワイルドカード
      "/*", // 必須ワイルドカード
    ];
    expect(sorted).toStrictEqual(expected);
  });
});

describe("エッジケース", () => {
  test("全く同じパスを比較したとき、0 を返す", ({ expect }) => {
    // Arrange
    const path = "/books/:genre";

    // Act
    const result = compareRoutePaths(path, path);

    // Assert
    expect(result).toBe(0);
  });

  test("末尾のスラッシュの有無に関わらず、セグメントの内容が同じであれば同一とみなす", ({ expect }) => {
    // Arrange
    const pathA = "/books/horror";
    const pathB = "/books/horror/";

    // Act
    const result = compareRoutePaths(pathA, pathB);

    // Assert
    expect(result).toBe(0);
  });
});
