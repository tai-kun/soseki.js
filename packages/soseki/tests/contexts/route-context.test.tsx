import * as React from "react";
import { test } from "vitest";
import { renderHook } from "vitest-browser-react";
import RouteContext, { type RouteContextValue } from "../../src/contexts/route-context.js";

/**
 * テスト用のカスタムフック。
 * React.use(RouteContext) の値を検証するために使用する。
 */
function useRouteContext() {
  return React.use(RouteContext);
}

test("Provider によって値が提供されているとき、現在のルート情報とアウトレットを取得できる", async ({ expect }) => {
  // Arrange
  const mockOutlet = React.createElement("div", null, "Child Route");
  const contextValue: RouteContextValue = {
    path: "/users/:id",
    index: false,
    params: { id: "123" },
    urlPath: "/users/123",
    outlet: mockOutlet,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouteContext value={contextValue}>{children}</RouteContext>
  );

  // Act
  const { result } = await renderHook(() => useRouteContext(), { wrapper });

  // Assert
  expect(result.current).not.toBeNull();
  expect(result.current?.path).toBe("/users/:id");
  expect(result.current?.params["id"]).toBe("123");
  expect(result.current?.outlet).toBe(mockOutlet);
});

test("子ルートが存在しないとき、outlet が null として提供される", async ({ expect }) => {
  // Arrange
  const contextValue: RouteContextValue = {
    path: "/about",
    index: false,
    params: {},
    urlPath: "/about",
    outlet: null,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouteContext value={contextValue}>{children}</RouteContext>
  );

  // Act
  const { result } = await renderHook(() => useRouteContext(), { wrapper });

  // Assert
  expect(result.current).not.toBeNull();
  expect(result.current?.outlet).toBeNull();
});

test("Provider が存在しないコンテキスト下では、値が null になる", async ({ expect }) => {
  // Arrange & Act
  const { result } = await renderHook(() => useRouteContext());

  // Assert
  expect(result.current).toBeNull();
});
