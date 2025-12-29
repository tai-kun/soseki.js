import { test } from "vitest";
import RedirectResponse from "../../src/core/redirect-response.js";

test("パス名を渡してインスタンス化したとき、エンコードされたパス名が保持される", ({ expect }) => {
  // Arrange
  const rawPathname = "/テスト/データ";
  const expectedEncodedPathname = "/%E3%83%86%E3%82%B9%E3%83%88/%E3%83%87%E3%83%BC%E3%82%BF";

  // Act
  const response = new RedirectResponse(rawPathname);

  // Assert
  expect(response.pathname).toBe(expectedEncodedPathname);
});

test("すでにエンコード済みのパス名を渡したとき、二重にエンコードされずそのままのパス名が保持される", ({ expect }) => {
  // Arrange
  const encodedPathname = "/%E3%83%86%E3%82%B9%E3%83%88";

  // Act
  const response = new RedirectResponse(encodedPathname);

  // Assert
  expect(response.pathname).toBe(encodedPathname);
});

test("空のパス名を渡したとき、ルートパスになる", ({ expect }) => {
  // Arrange
  const emptyPathname = "";

  // Act
  const response = new RedirectResponse(emptyPathname);

  // Assert
  expect(response.pathname).toBe("/");
});
