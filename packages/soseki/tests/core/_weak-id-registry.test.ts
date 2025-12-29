import { describe, test } from "vitest";
import WeakIdRegistry from "../../src/core/_weak-id-registry.js";

describe("オブジェクトの登録と ID の取得", () => {
  test("未登録のオブジェクトを set すると、新しい ID が発行される", ({ expect }) => {
    // Arrange
    const registry = new WeakIdRegistry<object>();
    const obj = {};

    // Act
    const id = registry.set(obj);

    // Assert
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  test("同じオブジェクトを再度 set すると、同じ ID が返される", ({ expect }) => {
    // Arrange
    const registry = new WeakIdRegistry<object>();
    const obj = {};
    const firstId = registry.set(obj);

    // Act
    const secondId = registry.set(obj);

    // Assert
    expect(secondId).toBe(firstId);
  });

  test("異なるオブジェクトを set すると、それぞれ異なる ID が発行される", ({ expect }) => {
    // Arrange
    const registry = new WeakIdRegistry<object>();
    const obj1 = {};
    const obj2 = {};

    // Act
    const id1 = registry.set(obj1);
    const id2 = registry.set(obj2);

    // Assert
    expect(id1).not.toBe(id2);
  });
});

describe("存在確認と双方向ルックアップ", () => {
  test("登録済みのオブジェクトに対して has を呼び出すと、true が返る", ({ expect }) => {
    // Arrange
    const registry = new WeakIdRegistry<object>();
    const obj = {};
    registry.set(obj);

    // Act
    const result = registry.has(obj);

    // Assert
    expect(result).toBe(true);
  });

  test("未登録のオブジェクトに対して has を呼び出すと、false が返る", ({ expect }) => {
    // Arrange
    const registry = new WeakIdRegistry<object>();
    const obj = {};

    // Act
    const result = registry.has(obj);

    // Assert
    expect(result).toBe(false);
  });

  test("オブジェクトから ID を取得すると、登録時に発行された ID と一致する", ({ expect }) => {
    // Arrange
    const registry = new WeakIdRegistry<object>();
    const obj = {};
    const expectedId = registry.set(obj);

    // Act
    const actualId = registry.get(obj);

    // Assert
    expect(actualId).toBe(expectedId);
  });

  test("ID からオブジェクトを取得すると、元のオブジェクトが返る", ({ expect }) => {
    // Arrange
    const registry = new WeakIdRegistry<object>();
    const obj = {};
    const id = registry.set(obj);

    // Act
    const retrievedObj = registry.get(id);

    // Assert
    expect(retrievedObj).toBe(obj);
  });

  test("未登録のオブジェクトを get すると、undefined が返る", ({ expect }) => {
    // Arrange
    const registry = new WeakIdRegistry<object>();
    const obj = {};

    // Act
    const result = registry.get(obj);

    // Assert
    expect(result).toBeUndefined();
  });

  test("存在しない ID を get すると、undefined が返る", ({ expect }) => {
    // Arrange
    const registry = new WeakIdRegistry<object>();

    // Act
    const result = registry.get("non-existent-id");

    // Assert
    expect(result).toBeUndefined();
  });
});

describe("ID 発行の仕様", () => {
  test("複数のオブジェクトを登録したとき、ID は 36 進数のインクリメント形式で発行される", ({ expect }) => {
    // Arrange
    const registry = new WeakIdRegistry<object>();
    const objects = [{}, {}, {}];

    // Act
    const ids = objects.map((obj) => registry.set(obj));

    // Assert
    expect(ids.length).toBe(3);
    expect(ids[0]).toBe("0");
    expect(ids[1]).toBe("1");
    expect(ids[2]).toBe("2");
  });
});
