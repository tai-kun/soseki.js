import * as React from "react";
import { test, vi } from "vitest";
import { renderHook } from "vitest-browser-react";
import RouterContext, { type RouterContextValue } from "../../src/contexts/router-context.js";
import useActionData from "../../src/hooks/use-action-data.js";

test("現在の履歴 ID とアクションに対応するデータが存在する場合、そのデータを返す", async ({ expect }) => {
  // Arrange
  const mockAction = (() => {}) as any;
  const mockData = { data: "test result" };

  // 特定のアクションに対応するデータを返す Map をシミュレートする。
  const actionMap = new Map();
  actionMap.set(mockAction, mockData);

  const mockRouterRef = {
    current: {
      currentEntry: { id: "entry-1" },
      actionDataStore: {
        get: (id: string) => (id === "entry-1" ? actionMap : undefined),
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
  const { result } = await renderHook(() => useActionData(mockAction), { wrapper });

  // Assert
  expect(result.current).toBe(mockData);
});

test("現在の履歴 ID に対応するデータストアが存在しない場合、undefined を返す", async ({ expect }) => {
  // Arrange
  const mockAction = (() => {}) as any;
  const mockRouterRef = {
    current: {
      currentEntry: { id: "unknown-entry" },
      actionDataStore: {
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

  // Act
  const { result } = await renderHook(() => useActionData(mockAction), { wrapper });

  // Assert
  expect(result.current).toBeUndefined();
});

test("履歴が遷移して現在のエントリー ID が変化したとき、新しい ID に基づくデータを返す", async ({ expect }) => {
  // Arrange
  const mockAction = (() => {}) as any;
  const data1 = { data: "result 1" };
  const data2 = { data: "result 2" };

  let callback: () => void = () => {};
  const subscribe = vi.fn((onStoreChange: () => void) => {
    callback = onStoreChange;
    return () => {};
  });

  const mockRouterRef = {
    current: {
      currentEntry: { id: "entry-1" },
      actionDataStore: {
        get: (id: string) => {
          const map = new Map();
          if (id === "entry-1") map.set(mockAction, data1);
          if (id === "entry-2") map.set(mockAction, data2);
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

  const { result, act } = await renderHook(() => useActionData(mockAction), { wrapper });

  // 初期状態の検証
  expect(result.current).toBe(data1);

  // Act
  await act(async () => {
    mockRouterRef.current = {
      ...mockRouterRef.current,
      currentEntry: { id: "entry-2" },
    };
    callback();
  });

  // Assert
  expect(result.current).toBe(data2);
});
