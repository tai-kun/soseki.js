import { test, vi } from "vitest";
import type { HistoryEntryId } from "../../src/core/history-entry-id-schema.js";
import initLoaders, { type InitLoadersParams } from "../../src/core/init-loaders.js";
import RouteRequest from "../../src/core/route-request.js";

test("指定されたルートのローダーがすべて実行され、データストアに保存されるとき、すべての処理が開始されるまで待機する", async ({ expect }) => {
  // Arrange
  const entryId = "59b2ba6e-5236-406c-9496-0a6bcd83b1ab" as HistoryEntryId;
  const entryUrl = new URL("https://example.com/test");
  const abortController = new AbortController();

  const loader1 = vi.fn().mockResolvedValue("data 1");
  const loader2 = vi.fn().mockResolvedValue("data 2");

  const routes = [
    {
      params: { id: "1" },
      dataFuncs: [{
        action: undefined,
        loader: loader1,
        shouldAction: () => true,
        shouldReload: () => true,
      }],
    },
    {
      params: { id: "2" },
      dataFuncs: [{
        action: undefined,
        loader: loader2,
        shouldAction: () => true,
        shouldReload: () => true,
      }],
    },
  ];

  const dataStoreSetMock = vi.fn();
  const dataStore = {
    set: dataStoreSetMock,
  } as any;

  const params: InitLoadersParams = {
    routes,
    entry: { id: entryId, url: entryUrl },
    dataStore,
    signal: abortController.signal,
  };

  // Act
  await initLoaders(params);

  // Assert
  // データストアへの保存を検証
  expect(dataStoreSetMock).toHaveBeenCalledTimes(1);
  const [savedId, dataMap] = dataStoreSetMock.mock.calls[0]!;
  expect(savedId).toBe(entryId);
  expect(dataMap.size).toBe(2);

  // 各ローダーに正しい引数が渡されていることを検証
  expect(loader1).toHaveBeenCalledWith(
    expect.objectContaining({
      params: { id: "1" },
      request: expect.any(RouteRequest),
    }),
  );
  expect(loader2).toHaveBeenCalledWith(
    expect.objectContaining({
      params: { id: "2" },
      request: expect.any(RouteRequest),
    }),
  );
});

test("ローダーが定義されていないルートが含まれるとき、そのルートをスキップして処理を継続する", async ({ expect }) => {
  // Arrange
  const entryId = "59b2ba6e-5236-406c-9496-0a6bcd83b1ab" as HistoryEntryId;
  const entryUrl = new URL("https://example.com/mixed");
  const loader = vi.fn().mockResolvedValue("data");

  const routes = [
    {
      params: {},
      dataFuncs: [{
        action: undefined,
        loader: undefined, // ローダーなし
        shouldAction: () => true,
        shouldReload: () => true,
      }],
    },
    {
      params: { id: "exists" },
      dataFuncs: [{
        action: undefined,
        loader,
        shouldAction: () => true,
        shouldReload: () => true,
      }],
    },
  ];

  const dataStoreSetMock = vi.fn();
  const dataStore = {
    set: dataStoreSetMock,
  } as any;

  const params: InitLoadersParams = {
    routes,
    entry: { id: entryId, url: entryUrl },
    dataStore,
    signal: new AbortController().signal,
  };

  // Act
  await initLoaders(params);

  // Assert
  const [, dataMap] = dataStoreSetMock.mock.calls[0]!;
  expect(dataMap.size).toBe(1);
  expect(loader).toHaveBeenCalledTimes(1);
});

test("ローダーがエラーを返したときでも、他のローダーの処理を妨げず、すべての待機を完了する", async ({ expect }) => {
  // Arrange
  const entryId = "59b2ba6e-5236-406c-9496-0a6bcd83b1ab" as HistoryEntryId;
  const entryUrl = new URL("https://example.com/error");

  // 成功するローダーと失敗するローダーを用意
  const successLoader = vi.fn().mockResolvedValue("success");
  const errorLoader = vi.fn().mockRejectedValue(new Error("Loader Failed"));

  const routes = [
    {
      params: {},
      dataFuncs: [{
        action: undefined,
        loader: errorLoader,
        shouldAction: () => true,
        shouldReload: () => true,
      }],
    },
    {
      params: {},
      dataFuncs: [{
        action: undefined,
        loader: successLoader,
        shouldAction: () => true,
        shouldReload: () => true,
      }],
    },
  ];

  const dataStoreSetMock = vi.fn();
  const dataStore = {
    set: dataStoreSetMock,
  } as any;

  const params: InitLoadersParams = {
    routes,
    entry: { id: entryId, url: entryUrl },
    dataStore,
    signal: new AbortController().signal,
  };

  // Act & Assert
  // Promise.allSettled を使用しているため、個別のエラーで initLoaders 自体は reject されない
  await expect(initLoaders(params)()).resolves.not.toThrow();

  expect(successLoader).toHaveBeenCalled();
  expect(errorLoader).toHaveBeenCalled();

  const [, dataMap] = dataStoreSetMock.mock.calls[0]!;
  expect(dataMap.size).toBe(2);
});
