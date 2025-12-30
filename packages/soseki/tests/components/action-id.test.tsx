import * as React from "react";
import { test } from "vitest";
import { render } from "vitest-browser-react";
import ActionId from "../../src/components/action-id.jsx";
import actionIdRegistry from "../../src/core/_action-id-registry.js";

test("アクションを渡したとき、そのアクションに対応する ID が設定された隠しフィールドがレンダリングされる", async ({ expect }) => {
  // Arrange
  const mockAction = async () => {};
  // 内部レジストリーで発行される ID と一致することを確認するため、期待値を取得する。
  const expectedId = actionIdRegistry.set(mockAction);

  // Act
  const { container } = await render(<ActionId action={mockAction} />);

  // Assert
  // コンポーネントが HiddenInput を介して正しい属性を出力しているかをスナップショットで検証する。
  expect(container).toMatchInlineSnapshot(`
    <div>
      <input
        hidden=""
        name="_soseki_action_id"
        style="display: none;"
        type="hidden"
        value="${expectedId}"
      />
    </div>
  `);
});

test("異なるアクションに変更されたとき、DOM の value 属性が新しいアクションの ID に更新される", async ({ expect }) => {
  // Arrange
  const actionA = async () => {};
  const actionB = async () => {};
  const idB = actionIdRegistry.set(actionB);
  const { container, rerender } = await render(<ActionId action={actionA} />);

  // Act
  await rerender(<ActionId action={actionB} />);

  // Assert
  // 再レンダリング後に value 属性が actionB に紐づく ID に切り替わっていることを検証する。
  expect(container).toMatchInlineSnapshot(`
    <div>
      <input
        hidden=""
        name="_soseki_action_id"
        style="display: none;"
        type="hidden"
        value="${idB}"
      />
    </div>
  `);
});

test("同一のアクションで再レンダリングされたとき、DOM 構造および ID は維持される", async ({ expect }) => {
  // Arrange
  const mockAction = async () => {};
  const expectedId = actionIdRegistry.set(mockAction);
  const { container, rerender } = await render(<ActionId action={mockAction} />);

  // Act
  await rerender(<ActionId action={mockAction} />);

  // Assert
  // React.memo により、同一アクションであれば不要な更新が発生せず、ID が維持されていることを検証する。
  expect(container).toMatchInlineSnapshot(`
    <div>
      <input
        hidden=""
        name="_soseki_action_id"
        style="display: none;"
        type="hidden"
        value="${expectedId}"
      />
    </div>
  `);
});
