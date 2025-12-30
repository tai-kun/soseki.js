import { describe, test } from "vitest";
import type { DataFunctionObject } from "../../src/core/route.types.js";
import index, {
  type IndexRouteEntryModule,
  type IndexRouteModule,
} from "../../src/utils/route-index.js";

describe("単一のモジュールからインデックスルートを生成する場合", () => {
  test("モジュールを渡したとき、children が undefined であるルート定義オブジェクトを返す", ({ expect }) => {
    // Arrange
    const mod: IndexRouteModule<"/dashboard"> = {
      path: "/dashboard",
      default: () => null,
    };

    // Act
    const result = index(mod);

    // Assert
    expect(result.path).toBe("/dashboard");
    expect(result.component).toBe(mod.default);
    // インデックスルートとして children が存在しないことを確認する
    expect(result.children).toBeUndefined();

    expect(result.dataFunctions).toHaveLength(1);
    expect(result.dataFunctions?.[0]).toBe(mod);
  });
});

describe("複数のモジュール配列からインデックスルートを生成する場合", () => {
  test("エントリーモジュールと追加のデータ操作関数を渡したとき、それらが統合されつつ children が undefined な定義を返す", ({ expect }) => {
    // Arrange
    const entry: IndexRouteEntryModule<"/settings"> = {
      path: "/settings",
    };
    const uiMod: DataFunctionObject<"/settings"> = {
      loader: async () => ({ theme: "dark" }),
    };

    // Act
    const result = index([entry, uiMod]);

    // Assert
    expect(result.path).toBe("/settings");
    expect(result.children).toBeUndefined();

    expect(result.dataFunctions).toHaveLength(2);
    expect(result.dataFunctions?.[0]).toBe(entry);
    expect(result.dataFunctions?.[1]).toBe(uiMod);
  });
});

describe("振る舞いの整合性", () => {
  test("生成されたオブジェクトは route 関数で生成されたものと同様の構造を持ちつつ children のみが書き換わっている", ({ expect }) => {
    // Arrange
    const mod: IndexRouteModule<"/"> = {
      path: "/",
      loader: async () => ({}),
    };

    // Act
    const result = index(mod);

    // Assert
    expect(result).toHaveProperty("path");
    expect(result).toHaveProperty("dataFunctions");
    expect(result).toHaveProperty("children", undefined);
  });
});
