import * as React from "react";
import { test } from "vitest";
import { render } from "vitest-browser-react";
import Outlet from "../../src/components/outlet.jsx";
import RouteContext from "../../src/contexts/route-context.js";

test("RouteContext が提供されているとき、コンテキスト内の outlet 要素がレンダリングされる", async ({ expect }) => {
  // Arrange
  const mockOutlet = <div data-testid="child">子ルートのコンテンツ</div>;
  const contextValue = { outlet: mockOutlet };

  // Act
  const { container } = await render(
    <RouteContext value={contextValue as any}>
      <Outlet />
    </RouteContext>,
  );

  // Assert
  // outlet に渡された要素がそのまま描画されていることをスナップショットで検証する。
  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        data-testid="child"
      >
        子ルートのコンテンツ
      </div>
    </div>
  `);
});

test("RouteContext 内の outlet が null のとき、何もレンダリングされない", async ({ expect }) => {
  // Arrange
  const contextValue = { outlet: null };

  // Act
  const { container } = await render(
    <RouteContext value={contextValue as any}>
      <Outlet />
    </RouteContext>,
  );

  // Assert
  expect(container).toMatchInlineSnapshot(`
    <div />
  `);
});

test("RouteContext が提供されていないとき、RouteContextMissingError をスローする", async ({ expect }) => {
  // Act & Assert
  await expect(render(<Outlet />))
    .rejects
    .toThrow("RouteContext not found. Did you forget to wrap your app in <Router />?");
});
