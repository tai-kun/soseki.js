import { describe, test } from "vitest";
import preprocessRoutes from "../../src/core/_process-routes.js";
import type { RouteDefinition } from "../../src/core/route.types.js";

describe("パスの正規化とマッチング", () => {
  test("階層構造を持つルート定義を渡したとき、親のパスを引き継いで正規化される", ({ expect }) => {
    // Arrange
    const routes: RouteDefinition[] = [
      {
        path: "parent",
        children: [
          { path: "child" },
        ],
      },
    ];

    // Act
    const result = preprocessRoutes(routes);

    // Assert
    expect(result[0]?.path).toBe("/parent");
    expect(result[0]?.children[0]?.path).toBe("/parent/child");
  });

  test("ルート定義が入れ子になっているとき、パスパターンの正規表現が適切に生成される", ({ expect }) => {
    // Arrange
    const routes: RouteDefinition[] = [
      {
        path: "/users",
        children: [
          { path: ":id" },
        ],
      },
    ];

    // Act
    const result = preprocessRoutes(routes);
    const childRoute = result[0]?.children[0];

    // Assert
    expect(childRoute?.pathPattern).toBeInstanceOf(RegExp);
    expect(childRoute?.pathPattern.test("/users/123")).toBe(true);
    expect(childRoute?.paramKeys).toStrictEqual(["id"]);
  });

  test("複数のルートが存在するとき、パスの文字列順でソートされる", ({ expect }) => {
    // Arrange
    const routes: RouteDefinition[] = [
      { path: "/zebra" },
      { path: "/apple" },
    ];

    // Act
    const result = preprocessRoutes(routes);

    // Assert
    expect(result[0]?.path).toBe("/apple");
    expect(result[1]?.path).toBe("/zebra");
  });
});

describe("データ操作関数の補完", () => {
  test("dataFunctions が未定義の場合、空の配列として処理される", ({ expect }) => {
    // Arrange
    const routes: RouteDefinition[] = [
      { path: "/" },
    ];

    // Act
    const result = preprocessRoutes(routes);

    // Assert
    expect(result[0]?.dataFuncs).toStrictEqual([]);
  });

  test("shouldAction または shouldReload が未定義のとき、常にデフォルト判定を返す関数が設定される", ({ expect }) => {
    // Arrange
    const routes: RouteDefinition[] = [
      {
        path: "/",
        dataFunctions: [
          {
            loader: async () => ({}),
            // shouldReload と shouldAction は省略
          },
        ],
      },
    ];

    // Act
    const result = preprocessRoutes(routes);
    const dataFunc = result[0]?.dataFuncs[0];

    // Assert
    expect(dataFunc?.shouldAction({ defaultShouldAction: true } as any)).toBe(true);
    expect(dataFunc?.shouldReload({ defaultShouldReload: false } as any)).toBe(false);
  });

  test("定義された action や loader がそのまま保持される", ({ expect }) => {
    // Arrange
    const mockLoader = async () => ({ message: "hello" });
    const routes: RouteDefinition[] = [
      {
        path: "/",
        dataFunctions: [{ loader: mockLoader }],
      },
    ];

    // Act
    const result = preprocessRoutes(routes);

    // Assert
    expect(result[0]?.dataFuncs[0]?.loader).toBe(mockLoader);
  });
});

describe("ルートの属性判定", () => {
  test("子ルートを持たないルートは、index 属性が true になる", ({ expect }) => {
    // Arrange
    const routes: RouteDefinition[] = [
      { path: "/leaf" },
    ];

    // Act
    const result = preprocessRoutes(routes);

    // Assert
    expect(result[0]?.index).toBe(true);
  });

  test("子ルートを持つルートは、index 属性が false になる", ({ expect }) => {
    // Arrange
    const routes: RouteDefinition[] = [
      {
        path: "/parent",
        children: [{ path: "child" }],
      },
    ];

    // Act
    const result = preprocessRoutes(routes);

    // Assert
    expect(result[0]?.index).toBe(false);
  });
});
