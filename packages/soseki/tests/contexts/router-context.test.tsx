import * as React from "react";
import { test, vi } from "vitest";
import { renderHook } from "vitest-browser-react";
import RouterContext, { type RouterContextValue } from "../../src/contexts/router-context.js";
import type { HistoryEntryId } from "../../src/core/history-entry-id-schema.js";

/**
 * テスト用のカスタムフック。
 * React.use(RouterContext) の値を検証するために使用する。
 */
function useTestRouter() {
  const context = React.use(RouterContext);
  return context;
}

test("Provider によって値が提供されているとき、コンテキストから routerRef を取得できる", async ({ expect }) => {
  // Arrange
  const mockRouterRef = {
    current: {
      submit: vi.fn(),
      navigate: vi.fn(),
      currentEntry: {
        id: "7801c3f4-a0d4-45c6-9fda-85333219ba3c" as HistoryEntryId,
        url: new URL("http://localhost/"),
        index: 0,
      },
      actionDataStore: {} as any,
      loaderDataStore: {} as any,
    },
  };
  const mockSubscribe = vi.fn(() => vi.fn());
  const value: RouterContextValue = {
    routerRef: mockRouterRef,
    subscribe: mockSubscribe,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouterContext value={value}>{children}</RouterContext>
  );

  // Act
  const { result } = await renderHook(() => useTestRouter(), { wrapper });

  // Assert
  expect(result.current).not.toBeNull();
  expect(result.current?.routerRef).toBe(mockRouterRef);
});

test("Provider によって値が提供されているとき、コンテキストから subscribe 関数を取得できる", async ({ expect }) => {
  // Arrange
  const mockRouterRef = { current: null } as any;
  const mockSubscribe = vi.fn(() => vi.fn());
  const value: RouterContextValue = {
    routerRef: mockRouterRef,
    subscribe: mockSubscribe,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouterContext value={value}>{children}</RouterContext>
  );

  // Act
  const { result } = await renderHook(() => useTestRouter(), { wrapper });

  // Assert
  expect(result.current).not.toBeNull();
  expect(typeof result.current?.subscribe).toBe("function");
});

test("Provider が存在しないとき、コンテキストの値が null になる", async ({ expect }) => {
  // Arrange & Act
  const { result } = await renderHook(() => useTestRouter());

  // Assert
  expect(result.current).toBeNull();
});
