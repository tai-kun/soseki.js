import React from "react";
import { test } from "vitest";
import { render } from "vitest-browser-react";
import HiddenInput from "../../src/components/hidden-input.jsx";

test("name 属性と value 属性が指定されたとき、正しく設定された hidden 属性を持つ入力要素が表示される", async ({ expect }) => {
  // Arrange
  const name = "user_id";
  const value = "12345";

  // Act
  const { container } = await render(<HiddenInput name={name} value={value} />);

  // Assert
  expect(container).toMatchInlineSnapshot(`
    <div>
      <input
        hidden=""
        name="user_id"
        style="display: none;"
        type="hidden"
        value="12345"
      />
    </div>
  `);
});

test("値が変更されて再レンダリングされたとき、DOM の value 属性が更新される", async ({ expect }) => {
  // Arrange
  const name = "session_token";
  const initialValue = "token_a";
  const updatedValue = "token_b";
  const { container, rerender } = await render(<HiddenInput name={name} value={initialValue} />);

  // Act
  await rerender(<HiddenInput name={name} value={updatedValue} />);

  // Assert
  expect(container).toMatchInlineSnapshot(`
    <div>
      <input
        hidden=""
        name="session_token"
        style="display: none;"
        type="hidden"
        value="${updatedValue}"
      />
    </div>
  `);
});
