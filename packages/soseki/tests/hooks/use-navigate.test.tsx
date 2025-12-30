import * as React from "react";
import { test, vi } from "vitest";
import { renderHook } from "vitest-browser-react";
import RouterContext, { type RouterContextValue } from "../../src/contexts/router-context.js";
import useNavigate from "../../src/hooks/use-navigate.js";

test("文字列のパスが渡されたとき、履歴を push する設定でナビゲーションを実行する", async ({ expect }) => {
  // Arrange
  const navigateSpy = vi.fn();
  const mockRouterRef = {
    current: {
      navigate: navigateSpy,
    },
  };
  const contextValue: RouterContextValue = {
    routerRef: mockRouterRef as any,
    subscribe: vi.fn(() => vi.fn()),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouterContext value={contextValue}>{children}</RouterContext>
  );

  const { result } = await renderHook(() => useNavigate(), { wrapper });

  // Act
  result.current("/new-path");

  // Assert
  expect(navigateSpy).toHaveBeenCalledWith({
    to: "/new-path",
    history: "push",
  });
});

test("replace オプションに true が渡されたとき、履歴を replace する設定でナビゲーションを実行する", async ({ expect }) => {
  // Arrange
  const navigateSpy = vi.fn();
  const mockRouterRef = {
    current: { navigate: navigateSpy },
  };
  const contextValue: RouterContextValue = {
    routerRef: mockRouterRef as any,
    subscribe: vi.fn(() => vi.fn()),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouterContext value={contextValue}>{children}</RouterContext>
  );

  const { result } = await renderHook(() => useNavigate(), { wrapper });

  // Act
  result.current("/replace-path", { replace: true });

  // Assert
  expect(navigateSpy).toHaveBeenCalledWith({
    to: "/replace-path",
    history: "replace",
  });
});

test("数値が渡されたとき、履歴スタックの相対位置（delta）を指定してナビゲーションを実行する", async ({ expect }) => {
  // Arrange
  const navigateSpy = vi.fn();
  const mockRouterRef = {
    current: { navigate: navigateSpy },
  };
  const contextValue: RouterContextValue = {
    routerRef: mockRouterRef as any,
    subscribe: vi.fn(() => vi.fn()),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouterContext value={contextValue}>{children}</RouterContext>
  );

  const { result } = await renderHook(() => useNavigate(), { wrapper });

  // Act
  result.current(-1);

  // Assert
  expect(navigateSpy).toHaveBeenCalledWith({
    delta: -1,
  });
});
