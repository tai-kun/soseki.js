import { describe, test } from "vitest";
import { UnexpectedValidationError } from "../../src/core/errors.js";
import expectHistoryEntry, { type HistoryEntryLike } from "../../src/core/expect-history-entry.js";

describe("有効な入力が与えられた場合", () => {
  test("すべての項目が正当なとき、バリデーション済みの履歴エントリーを返す", ({ expect }) => {
    // Arrange
    const input: HistoryEntryLike = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      url: "https://example.com/",
      index: 0,
    };

    // Act
    const result = expectHistoryEntry(input);

    // Assert
    expect(result).not.toBeNull();
    expect(result?.id).toBe(input.id);
    expect(result?.url.href).toBe(input.url);
    expect(result?.index).toBe(input.index);
  });
});

describe("入力値が空または欠損している場合", () => {
  test("null が与えられたとき、null を返す", ({ expect }) => {
    // Arrange
    const input = null;

    // Act
    const result = expectHistoryEntry(input);

    // Assert
    expect(result).toBeNull();
  });

  test("undefined が与えられたとき、null を返す", ({ expect }) => {
    // Arrange
    const input = undefined;

    // Act
    const result = expectHistoryEntry(input);

    // Assert
    expect(result).toBeNull();
  });

  test("url が null のとき、null を返す", ({ expect }) => {
    // Arrange
    const input: HistoryEntryLike = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      url: null,
      index: 1,
    };

    // Act
    const result = expectHistoryEntry(input);

    // Assert
    expect(result).toBeNull();
  });
});

describe("不正な形式のデータが与えられた場合", () => {
  test("index が負の整数のとき、エラーを投げる", ({ expect }) => {
    // Arrange
    const input: HistoryEntryLike = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      url: "https://example.com/",
      index: -1,
    };

    // Act & Assert
    expect(() => expectHistoryEntry(input)).toThrow(UnexpectedValidationError);
  });

  test("id が UUID 形式でないとき、エラーを投げる", ({ expect }) => {
    // Arrange
    const input: HistoryEntryLike = {
      id: "invalid-id",
      url: "https://example.com/",
      index: 0,
    };

    // Act & Assert
    expect(() => expectHistoryEntry(input)).toThrow(UnexpectedValidationError);
  });

  test("url が不正形式のとき、エラーを投げる", ({ expect }) => {
    // Arrange
    const input: HistoryEntryLike = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      url: "invalid-url",
      index: 0,
    };

    // Act & Assert
    expect(() => expectHistoryEntry(input)).toThrow();
  });

  test("index が整数ではないとき、エラーを投げる", ({ expect }) => {
    // Arrange
    const input: HistoryEntryLike = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      url: "https://example.com/",
      index: 1.5,
    };

    // Act & Assert
    expect(() => expectHistoryEntry(input)).toThrow(UnexpectedValidationError);
  });
});
