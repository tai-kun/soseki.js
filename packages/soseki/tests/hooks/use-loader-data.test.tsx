import * as React from "react";
import { test, vi } from "vitest";
import { renderHook } from "vitest-browser-react";
import RouterContext, { type RouterContextValue } from "../../src/contexts/router-context.js";
import { LoaderDataNotFoundError } from "../../src/core/errors.js";
import useLoaderData from "../../src/hooks/use-loader-data.js";

test("現在の履歴 ID とローダーに対応するデータが存在する場合、そのデータを返す", async ({ expect }) => {
  // Arrange
  const mockLoader = (() => {}) as any;
  const mockData = { data: "loaded content" };

  // 特定のローダーに対応するデータを保持する Map を作成する。
  const loaderMap = new Map();
  loaderMap.set(mockLoader, mockData);

  const mockRouterRef = {
    current: {
      currentEntry: { id: "entry-1" },
      loaderDataStore: {
        get: (id: string) => (id === "entry-1" ? loaderMap : undefined),
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
  const { result } = await renderHook(() => useLoaderData(mockLoader), { wrapper });

  // Assert
  expect(result.current).toBe(mockData);
});

test("現在の履歴 ID に対応するデータが存在しない場合、LoaderDataNotFoundError を投げる", async ({ expect }) => {
  // Arrange
  const mockLoader = (() => {}) as any;
  const mockRouterRef = {
    current: {
      currentEntry: { id: "unknown-entry" },
      loaderDataStore: {
        get: () => undefined,
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

  // Act & Assert
  await expect(renderHook(() => useLoaderData(mockLoader), { wrapper }))
    .rejects
    .toThrow(LoaderDataNotFoundError);
});

test("指定されたローダーがストアに含まれていない場合、LoaderDataNotFoundError を投げる", async ({ expect }) => {
  // Arrange
  const mockLoader = (() => {}) as any;
  const otherLoader = (() => {}) as any;

  const loaderMap = new Map();
  loaderMap.set(otherLoader, { data: "other" }); // 別のローダーのみ存在。

  const mockRouterRef = {
    current: {
      currentEntry: { id: "entry-1" },
      loaderDataStore: {
        get: () => loaderMap,
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

  // Act & Assert
  await expect(renderHook(() => useLoaderData(mockLoader), { wrapper }))
    .rejects
    .toThrow(LoaderDataNotFoundError);
});

test("履歴 ID が更新されたとき、新しい ID に基づいて最新のデータを返す", async ({ expect }) => {
  // Arrange
  const mockLoader = (() => {}) as any;
  const data1 = { content: "first" };
  const data2 = { content: "second" };

  let updateStore: () => void = () => {};
  const subscribe = vi.fn((onStoreChange: () => void) => {
    updateStore = onStoreChange;
    return () => {};
  });

  const mockRouterRef = {
    current: {
      currentEntry: { id: "entry-1" },
      loaderDataStore: {
        get: (id: string) => {
          const map = new Map();
          if (id === "entry-1") map.set(mockLoader, data1);
          if (id === "entry-2") map.set(mockLoader, data2);
          return map;
        },
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

  const { result, act } = await renderHook(() => useLoaderData(mockLoader), { wrapper });

  // 初期状態の確認
  expect(result.current).toBe(data1);

  // Act
  await act(async () => {
    mockRouterRef.current = {
      ...mockRouterRef.current,
      currentEntry: { id: "entry-2" },
    };
    updateStore();
  });

  // Assert
  expect(result.current).toBe(data2);
});
