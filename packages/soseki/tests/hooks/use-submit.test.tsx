import * as React from "react";
import { test, vi } from "vitest";
import { renderHook } from "vitest-browser-react";
import RouteContext, { type RouteContextValue } from "../../src/contexts/route-context.js";
import RouterContext, { type RouterContextValue } from "../../src/contexts/router-context.js";
import useSubmit from "../../src/hooks/use-submit.js";

test("FormData を渡したとき、デフォルトの action を使用して POST 送信を実行する", async ({ expect }) => {
  // Arrange
  const submitSpy = vi.fn();
  const mockRouterRef = {
    current: { submit: submitSpy },
  };

  const routerContextValue: RouterContextValue = {
    routerRef: mockRouterRef as any,
    subscribe: vi.fn(() => vi.fn()),
  };

  const routeContextValue: RouteContextValue = {
    path: "/posts/:id",
    index: false,
    params: { id: "1" },
    urlPath: "/posts/1",
    outlet: null,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouterContext value={routerContextValue}>
      <RouteContext value={routeContextValue}>
        {children}
      </RouteContext>
    </RouterContext>
  );

  const { result } = await renderHook(() => useSubmit(), { wrapper });
  const formData = new FormData();
  formData.append("title", "Hello");

  // Act
  result.current(formData);

  // Assert
  expect(submitSpy).toHaveBeenCalledWith({
    target: formData,
    action: "/posts/1",
    actionId: undefined,
  });
});

test("URLSearchParams を渡したとき、デフォルトで push 履歴として GET 送信を実行する", async ({ expect }) => {
  // Arrange
  const submitSpy = vi.fn();
  const mockRouterRef = {
    current: { submit: submitSpy },
  };

  const routerContextValue: RouterContextValue = {
    routerRef: mockRouterRef as any,
    subscribe: vi.fn(() => vi.fn()),
  };

  const routeContextValue: RouteContextValue = {
    path: "/search",
    index: false,
    params: {},
    urlPath: "/search",
    outlet: null,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouterContext value={routerContextValue}>
      <RouteContext value={routeContextValue}>
        {children}
      </RouteContext>
    </RouterContext>
  );

  const { result } = await renderHook(() => useSubmit(), { wrapper });
  const params = new URLSearchParams({ q: "vitest" });

  // Act
  result.current(params);

  // Assert
  expect(submitSpy).toHaveBeenCalledWith({
    target: params,
    action: "/search",
    history: "push",
  });
});

test("replace オプションを指定して URLSearchParams を送信したとき、履歴を置換する", async ({ expect }) => {
  // Arrange
  const submitSpy = vi.fn();
  const mockRouterRef = {
    current: { submit: submitSpy },
  };

  const routerContextValue: RouterContextValue = {
    routerRef: mockRouterRef as any,
    subscribe: vi.fn(() => vi.fn()),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouterContext value={routerContextValue}>
      <RouteContext value={{ urlPath: "/list" } as any}>
        {children}
      </RouteContext>
    </RouterContext>
  );

  const { result } = await renderHook(() => useSubmit(), { wrapper });
  const params = new URLSearchParams();

  // Act
  result.current(params, { replace: true });

  // Assert
  expect(submitSpy).toHaveBeenCalledWith({
    target: params,
    action: "/list",
    history: "replace",
  });
});

test("actionId を指定して FormData を送信したとき、指定された ID で送信を実行する", async ({ expect }) => {
  // Arrange
  const submitSpy = vi.fn();
  const mockAction = (() => {}) as any;
  const mockRouterRef = {
    current: { submit: submitSpy },
  };

  const routerContextValue: RouterContextValue = {
    routerRef: mockRouterRef as any,
    subscribe: vi.fn(() => vi.fn()),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouterContext value={routerContextValue}>
      <RouteContext value={{ urlPath: "/target" } as any}>
        {children}
      </RouteContext>
    </RouterContext>
  );

  const { result } = await renderHook(() => useSubmit(), { wrapper });
  const formData = new FormData();

  // Act
  result.current(formData, { actionId: mockAction });

  // Assert
  expect(submitSpy).toHaveBeenCalledWith({
    target: formData,
    action: "/target",
    actionId: mockAction,
  });
});
