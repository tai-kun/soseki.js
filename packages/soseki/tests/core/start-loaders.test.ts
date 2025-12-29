import { describe, test, vi } from "vitest";
import { IDataStore } from "../../src/core/data-store.types.js";
import DeferredPromise from "../../src/core/deferred-promise.js";
import { LoaderConditionError } from "../../src/core/errors.js";
import { HistoryEntryId } from "../../src/core/history-entry-id-schema.js";
import { IAction, ILoader } from "../../src/core/route.types.js";
import startLoaders, { StartLoadersParams } from "../../src/core/start-loaders.js";

describe("ローダーの実行判定", () => {
  test("前回のエントリーにデータが存在しないとき、ローダーが新規に実行される", async ({ expect }) => {
    // Arrange
    const loader = vi.fn().mockResolvedValue("data");
    const params = createParams({
      currentRoutes: [
        {
          path: "/",
          params: {},
          dataFuncs: [{
            action: undefined,
            loader,
            shouldAction: () => expect.unreachable(),
            shouldReload: () => true,
          }],
        },
      ],
    });

    // Act
    const wait = startLoaders(params);
    await wait?.();

    // Assert
    expect(loader).toHaveBeenCalledOnce();
  });

  test("shouldReload が false を返すとき、前回のデータが引き継がれローダーは再実行されない", async ({ expect }) => {
    // Arrange
    const loader = vi.fn().mockResolvedValue("new data");
    const prevData = Promise.resolve("old data");

    const loaderDataStore = createStubDataStore();
    // 前回のデータをストアにセットしておく。
    const prevEntryId = "8ce9bfcd-fe55-440a-80db-e90cb6e93ac5" as HistoryEntryId;
    const prevMap = new Map();
    prevMap.set(loader, prevData);
    loaderDataStore.set(prevEntryId, prevMap);

    const params = createParams({
      prevEntry: {
        id: prevEntryId,
        url: new URL("http://localhost/"),
      },
      loaderDataStore,
      currentRoutes: [
        {
          path: "/",
          params: {},
          dataFuncs: [{
            action: undefined,
            loader,
            shouldAction: () => expect.unreachable(),
            shouldReload: () => false,
          }],
        },
      ],
    });

    // Act
    const wait = startLoaders(params);
    await wait?.();

    // Assert
    const currentMap = loaderDataStore.get(params.currentEntry.id);
    expect(loader).not.toHaveBeenCalled();
    expect(await currentMap?.get(loader)).toBe("old data");
  });

  test("shouldReload が true を返すとき、ローダーが再実行される", async ({ expect }) => {
    // Arrange
    const loader: ILoader = async () => "new data";
    const prevData = Promise.resolve("old data");

    const loaderDataStore = createStubDataStore();
    const prevEntryId = "8ce9bfcd-fe55-440a-80db-e90cb6e93ac5" as HistoryEntryId;
    const prevMap = new Map();
    prevMap.set(loader, prevData);
    loaderDataStore.set(prevEntryId, prevMap);

    const params = createParams({
      prevEntry: {
        id: prevEntryId,
        url: new URL("http://localhost/"),
      },
      loaderDataStore,
      currentRoutes: [
        {
          path: "/",
          params: {},
          dataFuncs: [{
            action: undefined,
            loader,
            shouldAction: () => expect.unreachable(),
            shouldReload: () => true,
          }],
        },
      ],
    });

    // Act
    const wait = startLoaders(params);
    await wait?.();

    // Assert
    const currentMap = loaderDataStore.get(params.currentEntry.id);
    expect(await currentMap?.get(loader)).toBe("new data");
  });
});

describe("アクション実行後の挙動", () => {
  test("アクション実行後に shouldReload が呼ばれるとき、triggerMethod が POST になる", async ({ expect }) => {
    // Arrange
    let capturedTriggerMethod: string | undefined;
    const loader: ILoader = async () => "data";
    const prevData = DeferredPromise.resolve("old");
    const loaderDataStore = createStubDataStore();
    const prevEntryId = "8ce9bfcd-fe55-440a-80db-e90cb6e93ac5" as HistoryEntryId;
    loaderDataStore.set(prevEntryId, new Map([[loader, prevData]]));

    const params = createParams({
      prevEntry: {
        id: prevEntryId,
        url: new URL("http://localhost/"),
      },
      loaderDataStore,
      formData: new FormData(),
      actionResultMap: new Map(),
      currentRoutes: [
        {
          path: "/",
          params: {},
          dataFuncs: [{
            action: undefined,
            loader,
            shouldAction: () => expect.unreachable(),
            shouldReload: ({ triggerMethod }) => {
              capturedTriggerMethod = triggerMethod;
              return true;
            },
          }],
        },
      ],
    });

    // Act
    const wait = startLoaders(params);
    await wait?.();

    // Assert
    expect(capturedTriggerMethod).toBe("POST");
  });

  test("アクションが実行された場合、前回のアクションデータが引き継がれる", ({ expect }) => {
    // Arrange
    const action: IAction = async () => ({ success: true });
    const actionData = DeferredPromise.resolve({ success: true });
    const actionDataStore = createStubDataStore();
    const prevEntryId = "8ce9bfcd-fe55-440a-80db-e90cb6e93ac5" as HistoryEntryId;
    actionDataStore.set(prevEntryId, new Map([[action, actionData]]));

    const params = createParams({
      prevEntry: {
        id: prevEntryId,
        url: new URL("http://localhost/"),
      },
      actionDataStore,
      formData: new FormData(),
      actionResultMap: new Map(),
      currentRoutes: [
        {
          path: "/",
          params: {},
          dataFuncs: [{
            action,
            loader: async () => {},
            shouldAction: () => expect.unreachable(),
            shouldReload: () => false,
          }],
        },
      ],
    });

    // Act
    startLoaders(params);

    // Assert
    const currentActionMap = actionDataStore.get(params.currentEntry.id);
    expect(currentActionMap?.get(action)).toBe(actionData);
  });
});

describe("異常系", () => {
  test("shouldReload が Promise を返したとき、LoaderConditionError が発生する", async ({ expect }) => {
    // Arrange
    const loader: ILoader = async () => "data";
    const loaderDataStore = createStubDataStore();
    const prevEntryId = "8ce9bfcd-fe55-440a-80db-e90cb6e93ac5" as HistoryEntryId;
    loaderDataStore.set(prevEntryId, new Map([[loader, DeferredPromise.resolve("old")]]));

    const params = createParams({
      prevEntry: {
        id: prevEntryId,
        url: new URL("http://localhost/"),
      },
      loaderDataStore,
      currentRoutes: [
        {
          path: "/",
          params: {},
          dataFuncs: [{
            action: undefined,
            loader,
            shouldAction: () => expect.unreachable(),
            // 意図的に非同期関数にする。
            shouldReload: (async () => true) as any,
          }],
        },
      ],
    });

    // Act
    startLoaders(params);

    // Assert
    const currentMap = loaderDataStore.get(params.currentEntry.id);
    const dataPromise = currentMap?.get(loader);
    await expect(dataPromise).rejects.toThrow(LoaderConditionError);
  });
});

/**
 * テスト用の StartLoadersParams を作成する。
 */
function createParams(overrides: Partial<StartLoadersParams> = {}): StartLoadersParams {
  const params = {
    prevRoutes: null,
    currentRoutes: [],
    prevEntry: {
      id: "1e9a122d-ba56-4a57-9767-f8412ffc76f1" as HistoryEntryId,
      url: new URL("http://localhost/"),
    },
    currentEntry: {
      id: "d70c492b-7888-4a75-bf50-ec2ec758e643" as HistoryEntryId,
      url: new URL("http://localhost/"),
    },
    actionDataStore: createStubDataStore(),
    loaderDataStore: createStubDataStore(),
    signal: new AbortController().signal,
    ...overrides,
  } as StartLoadersParams;
  if (params.prevEntry.id === params.currentEntry.id) {
    throw new Error("同じエントリー ID: " + params.prevEntry.id);
  }

  return params;
}

/**
 * テスト用の IDataStore スタブを作成する。
 */
function createStubDataStore(): IDataStore<any> {
  const store = new Map<string, Map<any, any>>();
  return {
    get: (id: string) => store.get(id),
    set: (id: string, data: Map<any, any>) => store.set(id, data),
  } as unknown as IDataStore<any>;
}
