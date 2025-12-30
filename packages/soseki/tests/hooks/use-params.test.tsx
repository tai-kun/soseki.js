import * as React from "react";
import { test } from "vitest";
import { renderHook } from "vitest-browser-react";
import RouteContext, { type RouteContextValue } from "../../src/contexts/route-context.js";
import useParams from "../../src/hooks/use-params.js";

test("RouteContext が提供されているとき、現在のパスパラメーターを取得できる", async ({ expect }) => {
  // Arrange
  const mockParams = { id: "123", category: "books" };
  const mockValue: RouteContextValue = {
    path: "/categories/:category/items/:id",
    index: false,
    params: mockParams,
    urlPath: "/categories/books/items/123",
    outlet: null,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouteContext value={mockValue}>{children}</RouteContext>
  );

  // Act
  const { result } = await renderHook(() => useParams(), { wrapper });

  // Assert
  expect(result.current).toEqual(mockParams);
});

test("パスパラメーターが存在しないとき、空のオブジェクトを返す", async ({ expect }) => {
  // Arrange
  const mockValue: RouteContextValue = {
    path: "/about",
    index: false,
    params: {},
    urlPath: "/about",
    outlet: null,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouteContext value={mockValue}>{children}</RouteContext>
  );

  // Act
  const { result } = await renderHook(() => useParams(), { wrapper });

  // Assert
  expect(result.current).toEqual({});
});

test("ジェネリクスで型を指定したとき、指定した型のオブジェクトとしてパラメーターを返す", async ({ expect }) => {
  // Arrange
  const mockParams = { userId: "user-88" };
  const mockValue: RouteContextValue = {
    path: "/users/:userId",
    index: false,
    params: mockParams,
    urlPath: "/users/user-88",
    outlet: null,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouteContext value={mockValue}>{children}</RouteContext>
  );

  // Act
  const { result } = await renderHook(() => useParams<"/users/:userId">(), { wrapper });

  // Assert
  // ランタイムの振る舞いとして値が正しいことを検証する
  expect(result.current.userId).toBe("user-88");
});

test("RouteContext が存在しないとき、RouteContextMissingError を投げる", async ({ expect }) => {
  // Arrange & Act & Assert
  // useParams は内部で useRouteContext を呼び出しており、
  // useRouteContext がエラーを投げる仕様であることを間接的に検証する
  await expect(renderHook(() => useParams())).rejects.toThrow();
});
