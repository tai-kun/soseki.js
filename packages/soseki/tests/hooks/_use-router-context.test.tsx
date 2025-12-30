import * as React from "react";
import { test, vi } from "vitest";
import { renderHook } from "vitest-browser-react";
import RouterContext, { type RouterContextValue } from "../../src/contexts/router-context.js";
import { RouterContextMissingError } from "../../src/core/errors.js";
import useRouterContext from "../../src/hooks/_use-router-context.js";

test("Provider によって値が提供されているとき、セレクターを介して routerRef の現在の状態を取得できる", async ({ expect }) => {
  // Arrange
  const mockRouterRef = {
    current: {
      currentEntry: { id: "test-id", url: new URL("http://localhost/"), index: 0 },
      submit: vi.fn(),
      navigate: vi.fn(),
      actionDataStore: {} as any,
      loaderDataStore: {} as any,
    },
  };
  const subscribe = vi.fn(() => vi.fn());
  const contextValue: RouterContextValue = {
    routerRef: mockRouterRef as any,
    subscribe,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouterContext value={contextValue}>{children}</RouterContext>
  );

  // Act
  const { result } = await renderHook(() => useRouterContext((router) => router?.currentEntry), {
    wrapper,
  });

  // Assert
  expect(result.current).toBe(mockRouterRef.current.currentEntry);
});

test("ルーターの状態が更新されたとき、最新の状態を再取得する", async ({ expect }) => {
  // Arrange
  let callback: () => void = () => {};
  const subscribe = vi.fn((onStoreChange: () => void) => {
    callback = onStoreChange;
    return () => {};
  });

  const mockRouterRef = {
    current: {
      currentEntry: { id: "initial", url: new URL("http://localhost/"), index: 0 },
    },
  };

  const contextValue: RouterContextValue = {
    routerRef: mockRouterRef as any,
    subscribe,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouterContext value={contextValue}>{children}</RouterContext>
  );

  const { result, act } = await renderHook(
    () => useRouterContext(router => router.currentEntry),
    { wrapper },
  );

  // Act
  await act(async () => {
    mockRouterRef.current = {
      ...mockRouterRef.current,
      currentEntry: {
        id: "updated",
        url: new URL("http://localhost/next"),
        index: 1,
      },
    };
    callback();
  });

  // Assert
  expect(result.current?.id).toBe("updated");
});

test("Provider が存在しないとき、RouterContextMissingError を投げる", async ({ expect }) => {
  // Arrange
  const selector = (router: any) => router.currentEntry;

  // Act & Assert
  await expect(renderHook(() => useRouterContext(selector)))
    .rejects
    .toThrow(RouterContextMissingError);
});

test("アンマウント時に subscribe から返されたクリーンアップ関数を実行する", async ({ expect }) => {
  // Arrange
  const unsubscribe = vi.fn();
  const subscribe = vi.fn(() => unsubscribe);
  const mockRouterRef = { current: {} };

  const contextValue: RouterContextValue = {
    routerRef: mockRouterRef as any,
    subscribe,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouterContext value={contextValue}>{children}</RouterContext>
  );

  const { unmount } = await renderHook(() => useRouterContext(r => r), { wrapper });

  // Act
  await unmount();

  // Assert
  expect(unsubscribe).toHaveBeenCalled();
});
