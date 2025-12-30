import * as React from "react";
import { test } from "vitest";
import { renderHook } from "vitest-browser-react";
import RouteContext, { type RouteContextValue } from "../../src/contexts/route-context.js";
import { RouteContextMissingError } from "../../src/core/errors.js";
import useRouteContext from "../../src/hooks/_use-route-context.js";

test("Provider によって値が提供されているとき、コンテキストの値を返す", async ({ expect }) => {
  // Arrange
  const mockValue: RouteContextValue = {
    path: "/test",
    index: false,
    params: { id: "1" },
    urlPath: "/test/1",
    outlet: null,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouteContext value={mockValue}>{children}</RouteContext>
  );

  // Act
  const { result } = await renderHook(() => useRouteContext(), { wrapper });

  // Assert
  expect(result.current).toEqual(mockValue);
});

test("Provider が存在しないとき、RouteContextMissingError を投げる", async ({ expect }) => {
  // Act & Assert
  // renderHook 自体がエラーを投げることを期待する。
  await expect(renderHook(() => useRouteContext())).rejects.toThrow(RouteContextMissingError);
});

test("提供される outlet が React 要素である場合、正しくその要素を保持している", async ({ expect }) => {
  // Arrange
  const mockOutlet = React.createElement("div", { "data-testid": "outlet" });
  const mockValue: RouteContextValue = {
    path: "/",
    index: true,
    params: {},
    urlPath: "/",
    outlet: mockOutlet,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouteContext value={mockValue}>{children}</RouteContext>
  );

  // Act
  const { result } = await renderHook(() => useRouteContext(), { wrapper });

  // Assert
  expect(result.current.outlet).toBe(mockOutlet);
});
