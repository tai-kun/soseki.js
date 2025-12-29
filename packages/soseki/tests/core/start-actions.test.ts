import { describe, test, vi } from "vitest";
import actionIdRegistry from "../../src/core/_action-id-registry.js";
import { IDataStore } from "../../src/core/data-store.types.js";
import {
  ActionConditionError,
  ActionExecutionError,
  MultipleRedirectError,
} from "../../src/core/errors.js";
import { HistoryEntryId } from "../../src/core/history-entry-id-schema.js";
import RedirectResponse from "../../src/core/redirect-response.js";
import { IAction } from "../../src/core/route.types.js";
import startActions, { StartActionsParams } from "../../src/core/start-actions.js";

describe("アクションの実行判定", () => {
  test("アクションを持つルートが存在しないとき、undefined を返す", ({ expect }) => {
    // Arrange
    const params = createParams({
      routes: [
        {
          params: {},
          urlPath: "/",
          dataFuncs: [{
            action: undefined,
            loader: undefined,
            shouldAction: () => true,
            shouldReload: () => expect.unreachable(),
          }],
        },
      ],
    });

    // Act
    const wait = startActions(params);

    // Assert
    expect(wait).toBeUndefined();
  });

  test("shouldAction が true を返すとき、アクションが実行される", async ({ expect }) => {
    // Arrange
    const action = async () => "結果";
    const params = createParams({
      routes: [
        {
          params: {},
          urlPath: "/",
          dataFuncs: [{
            action,
            loader: undefined,
            shouldAction: () => true,
            shouldReload: () => expect.unreachable(),
          }],
        },
      ],
    });

    // Act
    const wait = startActions(params);
    const result = await wait!();

    // Assert
    expect(result.resultMap.get(action)).toBe("結果");
  });

  test("shouldAction が false を返すとき、アクションは実行されない", async ({ expect }) => {
    // Arrange
    const action = vi.fn();
    const params = createParams({
      routes: [
        {
          params: {},
          urlPath: "/",
          dataFuncs: [{
            action,
            loader: undefined,
            shouldAction: () => false,
            shouldReload: () => expect.unreachable(),
          }],
        },
      ],
    });

    // Act
    const wait = startActions(params);
    await wait?.();

    // Assert
    expect(action).not.toHaveBeenCalled();
  });

  test("フォームデータに _soseki_action_id が含まれるとき、ID が一致するアクションのみが実行される", async ({ expect }) => {
    // Arrange
    const action1 = async () => "result1";
    const action2 = async () => "result2";
    actionIdRegistry.set(action1);
    const id2 = actionIdRegistry.set(action2);

    const formData = new FormData();
    formData.set("_soseki_action_id", id2);
    const params = createParams({
      formData: formData,
      routes: [
        {
          params: {},
          urlPath: "/",
          dataFuncs: [
            {
              action: action1,
              loader: undefined,
              shouldAction: ({ defaultShouldAction }) => defaultShouldAction,
              shouldReload: () => expect.unreachable(),
            },
            {
              action: action2,
              loader: undefined,
              shouldAction: ({ defaultShouldAction }) => defaultShouldAction,
              shouldReload: () => expect.unreachable(),
            },
          ],
        },
      ],
    });

    // Act
    const wait = startActions(params);
    const result = await wait!();

    // Assert
    expect(result.resultMap.size).toBe(1);
    expect(result.resultMap.has(action2)).toBe(true);
    expect(result.resultMap.get(action2)).toBe("result2");
  });
});

describe("アクションの実行結果", () => {
  test("アクションが RedirectResponse を返したとき、結果の redirect フィールドにパスが設定される", async ({ expect }) => {
    // Arrange
    const action = async () => new RedirectResponse("/new-path");
    const params = createParams({
      routes: [
        {
          params: {},
          urlPath: "/",
          dataFuncs: [{
            action,
            loader: undefined,
            shouldAction: () => true,
            shouldReload: () => expect.unreachable(),
          }],
        },
      ],
    });

    // Act
    const wait = startActions(params);
    const result = await wait!();

    // Assert
    expect(result.redirect).toBe("/new-path");
    expect(result.resultMap.get(action)).toBeUndefined();
  });

  test("複数のアクションが実行され、一方がリダイレクトを返したとき、正常に処理される", async ({ expect }) => {
    // Arrange
    const action1 = async () => "data";
    const action2 = async () => new RedirectResponse("/path");
    const params = createParams({
      routes: [
        {
          params: {},
          urlPath: "/",
          dataFuncs: [
            {
              action: action1,
              loader: undefined,
              shouldAction: () => true,
              shouldReload: () => expect.unreachable(),
            },
            {
              action: action2,
              loader: undefined,
              shouldAction: () => true,
              shouldReload: () => expect.unreachable(),
            },
          ],
        },
      ],
    });

    // Act
    const wait = startActions(params);
    const result = await wait!();

    // Assert
    expect(result.redirect).toBe("/path");
    expect(result.resultMap.get(action1)).toBe("data");
  });
});

describe("異常系", () => {
  test("shouldAction が非同期処理（Promise）を返したとき、ActionConditionError を含む ActionExecutionError が発生する", async ({ expect }) => {
    // Arrange
    const action = async () => "data";
    const params = createParams({
      routes: [
        {
          params: {},
          urlPath: "/",
          dataFuncs: [{
            action,
            loader: undefined,
            shouldAction: async () => true,
            shouldReload: () => expect.unreachable(),
          }],
        },
      ],
    });

    // Act
    const wait = startActions(params);

    // Assert
    try {
      await wait!();
      expect.unreachable();
    } catch (ex) {
      expect(ex).toBeInstanceOf(ActionExecutionError);
      expect((ex as ActionExecutionError).meta.errors).toStrictEqual([
        {
          action,
          reason: expect.any(ActionConditionError),
        },
      ]);
    }
    // await expect(wait!()).rejects.toThrow(ActionConditionError);
  });

  test("アクションの実行中に例外が発生したとき、ActionExecutionError が発生する", async ({ expect }) => {
    // Arrange
    const error = new Error("失敗");
    const action = async () => {
      throw error;
    };
    const params = createParams({
      routes: [
        {
          params: {},
          urlPath: "/",
          dataFuncs: [{
            action,
            loader: undefined,
            shouldAction: () => true,
            shouldReload: () => expect.unreachable(),
          }],
        },
      ],
    });

    // Act
    const wait = startActions(params);

    // Assert
    await expect(wait!()).rejects.toThrow(ActionExecutionError);
  });

  test("複数のアクションが RedirectResponse を返したとき、MultipleRedirectError が発生する", async ({ expect }) => {
    // Arrange
    const action1 = async () => new RedirectResponse("/path1");
    const action2 = async () => new RedirectResponse("/path2");
    const params = createParams({
      routes: [
        {
          params: {},
          urlPath: "/",
          dataFuncs: [
            {
              action: action1,
              loader: undefined,
              shouldAction: () => true,
              shouldReload: () => expect.unreachable(),
            },
            {
              action: action2,
              loader: undefined,
              shouldAction: () => true,
              shouldReload: () => expect.unreachable(),
            },
          ],
        },
      ],
    });

    // Act
    const wait = startActions(params);

    // Assert
    await expect(wait!()).rejects.toThrow(MultipleRedirectError);
  });
});

/**
 * テスト用の StartActionsParams を作成する。
 */
function createParams(overrides: Partial<StartActionsParams> = {}): StartActionsParams {
  return {
    routes: [],
    entry: {
      id: "67b82512-bd7e-414f-942f-df733bd53a6e" as HistoryEntryId,
      url: new URL("http://localhost/"),
    },
    formData: new FormData(),
    dataStore: {
      get: () => undefined,
      set: () => {},
    } as unknown as IDataStore<IAction>,
    signal: new AbortController().signal,
    ...overrides,
  };
}
