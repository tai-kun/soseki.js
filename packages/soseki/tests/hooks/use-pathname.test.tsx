import * as React from "react";
import { test, vi } from "vitest";
import { renderHook } from "vitest-browser-react";
import RouterContext, { type RouterContextValue } from "../../src/contexts/router-context.js";
import usePathname from "../../src/hooks/use-pathname.js";

test("現在の履歴エントリーから URL のパスネームを取得できる", async ({ expect }) => {
  // Arrange
  const mockRouterRef = {
    current: {
      currentEntry: {
        url: new URL("https://example.com/path/to/page?query=1"),
      },
    },
  };
  const contextValue: RouterContextValue = {
    routerRef: mockRouterRef as any,
    subscribe: vi.fn(() => vi.fn()),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouterContext value={contextValue}>{children}</RouterContext>
  );

  // Act
  const { result } = await renderHook(() => usePathname(), { wrapper });

  // Assert
  expect(result.current).toBe("/path/to/page");
});

test("URL にクエリパラメーターやハッシュが含まれていても、パスネームのみを返す", async ({ expect }) => {
  // Arrange
  const mockRouterRef = {
    current: {
      currentEntry: {
        url: new URL("https://example.com/search?q=vitest#result"),
      },
    },
  };
  const contextValue: RouterContextValue = {
    routerRef: mockRouterRef as any,
    subscribe: vi.fn(() => vi.fn()),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouterContext value={contextValue}>{children}</RouterContext>
  );

  // Act
  const { result } = await renderHook(() => usePathname(), { wrapper });

  // Assert
  expect(result.current).toBe("/search");
});

test("履歴が遷移して URL が変化したとき、新しいパスネームを返す", async ({ expect }) => {
  // Arrange
  let callback: () => void = () => {};
  const subscribe = vi.fn((onStoreChange: () => void) => {
    callback = onStoreChange;
    return () => {};
  });

  const mockRouterRef = {
    current: {
      currentEntry: {
        url: new URL("https://example.com/initial"),
      },
    },
  };

  const contextValue: RouterContextValue = {
    routerRef: mockRouterRef as any,
    subscribe,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouterContext value={contextValue}>{children}</RouterContext>
  );

  const { result, act } = await renderHook(() => usePathname(), { wrapper });

  // Act
  await act(async () => {
    mockRouterRef.current = {
      ...mockRouterRef.current,
      currentEntry: {
        url: new URL("https://example.com/updated"),
      },
    };
    callback();
  });

  // Assert
  expect(result.current).toBe("/updated");
});
