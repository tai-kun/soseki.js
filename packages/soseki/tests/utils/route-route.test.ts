import { describe, test } from "vitest";
import type { DataFunctionObject } from "../../src/core/route.types.js";
import route, { type RouteEntryModule, type RouteModule } from "../../src/utils/route-route.js";

describe("単一のモジュールからルートを生成する場合", () => {
  test("モジュールと子ルートを渡したとき、正しく構成されたルート定義オブジェクトを返す", ({ expect }) => {
    // Arrange
    const mod: RouteModule<"/users"> = {
      path: "/users",
      default: () => null,
      loader: async () => ({}),
    };
    const children = [
      { path: "profile", children: [], dataFunctions: [] },
    ];

    // Act
    const result = route(mod, children);

    // Assert
    expect(result.path).toBe("/users");
    expect(result.component).toBe(mod.default);
    expect(result.children).toBe(children);

    expect(result.dataFunctions).toHaveLength(1);
    expect(result.dataFunctions?.[0]).toBe(mod);
  });

  test("コンポーネントが含まれないモジュールを渡したとき、component が undefined になる", ({ expect }) => {
    // Arrange
    const mod: RouteModule<"/api"> = {
      path: "/api",
      loader: async () => ({}),
    };

    // Act
    const result = route(mod, []);

    // Assert
    expect(result.component).toBeUndefined();
  });
});

describe("複数のモジュール配列からルートを生成する場合", () => {
  test("エントリーモジュールと追加のデータ操作関数を渡したとき、それらが統合されたルート定義を返す", ({ expect }) => {
    // Arrange
    const entry: RouteEntryModule<"/posts"> = {
      path: "/posts",
      default: () => null,
    };
    const uiMod: DataFunctionObject<"/posts"> = {
      loader: async () => ({ posts: [] }),
    };

    // Act
    const result = route([entry, uiMod], []);

    // Assert
    expect(result.path).toBe("/posts");
    expect(result.component).toBe(entry.default);

    expect(result.dataFunctions).toHaveLength(2);
    expect(result.dataFunctions?.[0]).toBe(entry);
    expect(result.dataFunctions?.[1]).toBe(uiMod);
  });
});

describe("子ルートの整合性", () => {
  test("子ルートが空の配列であるとき、children が空の状態で定義が生成される", ({ expect }) => {
    // Arrange
    const mod: RouteModule<"/"> = { path: "/" };

    // Act
    const result = route(mod, []);

    // Assert
    expect(result.children).toHaveLength(0);
    expect(Array.isArray(result.children)).toBe(true);
  });
});
