import * as React from "react";
import { test } from "vitest";
import { renderHook } from "vitest-browser-react";
import RouteContext, { type RouteContextValue } from "../../src/contexts/route-context.js";
import useFormAction from "../../src/hooks/use-form-action.js";

test("RouteContext が提供されているとき、現在のルートの urlPath をフォームの送信先として返す", async ({ expect }) => {
  // Arrange
  const mockValue: RouteContextValue = {
    path: "/users/:id/edit",
    index: false,
    params: { id: "42" },
    urlPath: "/users/42/edit",
    outlet: null,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouteContext.Provider value={mockValue}>{children}</RouteContext.Provider>
  );

  // Act
  const { result } = await renderHook(() => useFormAction(), { wrapper });

  // Assert
  expect(result.current).toBe("/users/42/edit");
});

test("ルートがインデックスルートであるとき、そのインデックスルートの urlPath を返す", async ({ expect }) => {
  // Arrange
  const mockValue: RouteContextValue = {
    path: "/",
    index: true,
    params: {},
    urlPath: "/",
    outlet: null,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouteContext.Provider value={mockValue}>{children}</RouteContext.Provider>
  );

  // Act
  const { result } = await renderHook(() => useFormAction(), { wrapper });

  // Assert
  expect(result.current).toBe("/");
});

test("コンテキスト内の urlPath が空文字列の場合、そのまま空文字列を返す", async ({ expect }) => {
  // Arrange
  const mockValue: RouteContextValue = {
    path: "",
    index: false,
    params: {},
    urlPath: "",
    outlet: null,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouteContext.Provider value={mockValue}>{children}</RouteContext.Provider>
  );

  // Act
  const { result } = await renderHook(() => useFormAction(), { wrapper });

  // Assert
  expect(result.current).toBe("");
});
