import { test } from "vitest";
import RedirectResponse from "../../src/core/redirect-response.js";
import redirect from "../../src/utils/redirect.js";

test("パスネームを指定したとき、そのパスネームを保持した RedirectResponse インスタンスを返す", ({ expect }) => {
  // Arrange
  const pathname = "/dashboard";

  // Act
  const result = redirect(pathname);

  // Assert
  expect(result).toBeInstanceOf(RedirectResponse);
  // 実装詳細ではなく、RedirectResponse の公開された振る舞いを通じて検証する
  expect(result.pathname).toBe(pathname);
});
