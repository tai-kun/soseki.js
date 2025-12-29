import { test, vi } from "vitest";
import { renderHook } from "vitest-browser-react";
import useSingleton from "../../src/core/_use-singleton.js";

test("最初のレンダリング時に、初期化関数が実行されてその結果を返す", async ({ expect }) => {
  // Arrange
  const expectedValue = "initial value";
  const initFn = () => expectedValue;

  // Act
  const { result } = await renderHook(() => useSingleton(initFn));

  // Assert
  expect(result.current).toBe(expectedValue);
});

test("再レンダリングが発生しても、初期化関数は二度目以降の実行はされない", async ({ expect }) => {
  // Arrange
  const initFn = vi.fn(() => ({ id: Math.random() }));

  // Act
  const { rerender } = await renderHook(() => useSingleton(initFn));

  // 再レンダリングを実行する。
  await rerender();
  await rerender();

  // Assert
  expect(initFn).toHaveBeenCalledTimes(1);
});

test("再レンダリングが発生しても、最初に生成されたオブジェクトと同一のインスタンスを返し続ける", async ({ expect }) => {
  // Arrange
  // 毎回新しいオブジェクトを生成する初期化関数を準備
  const initFn = () => ({ timestamp: Date.now() });

  // Act
  const { result, rerender } = await renderHook(() => useSingleton(initFn));
  const firstResult = result.current;

  await rerender();
  const secondResult = result.current;

  // Assert
  // 参照が同一であることを確認し、シングルトンとしての振る舞いを保証
  expect(secondResult).toBe(firstResult);
});
