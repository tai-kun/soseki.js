import { afterEach, beforeEach, describe, test, vi } from "vitest";
import processRoutes from "../../src/core/_process-routes.js";
import type { IDataStore } from "../../src/core/data-store.types.js";
import type { IAction, ILoader } from "../../src/core/route.types.js";
import NavigationApiEngine from "../../src/engines/navigation-api-engine.js";

let engine: NavigationApiEngine;
let mockNavigation: any;
let mockLoaderDataStore: IDataStore<ILoader>;
let mockActionDataStore: IDataStore<IAction>;
let abortController: AbortController;

beforeEach(() => {
  abortController = new AbortController();

  // Navigation API のモックを作成する
  mockNavigation = {
    currentEntry: {
      id: "59b2ba6e-5236-406c-9496-0a6bcd83b1ab",
      url: "http://localhost/home",
      index: 0,
      addEventListener: vi.fn(),
    },
    entries: vi.fn().mockReturnValue([]),
    addEventListener: vi.fn(),
    navigate: vi.fn(),
  };

  // グローバルオブジェクトに Navigation API を注入する
  vi.stubGlobal("navigation", mockNavigation);

  mockLoaderDataStore = {
    has: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
  } as any;

  mockActionDataStore = {
    has: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
  } as any;

  engine = new NavigationApiEngine();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("init", () => {
  test("現在の URL にマッチするルートが存在する場合、初期状態を生成する", ({ expect }) => {
    // Arrange
    const routes = processRoutes([
      { path: "/home" },
    ]);
    const args = {
      routes,
      getSignal: () => abortController.signal,
      loaderDataStore: mockLoaderDataStore,
    };

    // Act
    const state = engine.init(args);

    // Assert
    expect(state).not.toBeNull();
    expect(state?.entry.id).toBe("59b2ba6e-5236-406c-9496-0a6bcd83b1ab");
    expect(state?.routes).toHaveLength(1);
    expect(state?.routes[0]!.path).toBe("/home");
  });

  test("現在の URL にマッチするルートが存在しない場合、null を返す", ({ expect }) => {
    // Arrange
    const routes = processRoutes([
      { path: "/other" },
    ]);
    const args = {
      routes,
      getSignal: () => abortController.signal,
      loaderDataStore: mockLoaderDataStore,
    };

    // Act
    const state = engine.init(args);

    // Assert
    expect(state).toBeNull();
  });
});

describe("start", () => {
  test("開始したとき、navigate イベントリスナーを登録する", ({ expect }) => {
    // Arrange
    const update = vi.fn();
    const args = {
      routes: [],
      update,
      getSignal: () => abortController.signal,
      actionDataStore: mockActionDataStore,
      loaderDataStore: mockLoaderDataStore,
    };

    // Act
    engine.start(args);

    // Assert
    expect(mockNavigation.addEventListener).toHaveBeenCalledWith(
      "navigate",
      expect.any(Function),
      expect.objectContaining({ signal: abortController.signal }),
    );
  });

  test("開始したとき、既存のエントリーに対して dispose リスナーを登録する", ({ expect }) => {
    // Arrange
    const mockEntry = {
      id: "e88788c0-49b2-437b-a6b3-69c1bdbcc6da",
      addEventListener: vi.fn(),
    };
    mockNavigation.entries.mockReturnValue([mockEntry]);
    mockLoaderDataStore.has = vi.fn().mockReturnValue(true); // データが存在する場合のみ登録される

    const args = {
      routes: [],
      update: vi.fn(),
      getSignal: () => abortController.signal,
      actionDataStore: mockActionDataStore,
      loaderDataStore: mockLoaderDataStore,
    };

    // Act
    engine.start(args);

    // Assert
    expect(mockEntry.addEventListener).toHaveBeenCalledWith(
      "dispose",
      expect.any(Function),
      expect.objectContaining({ signal: abortController.signal }),
    );
  });
});

describe("navigate", () => {
  test("指定されたパスへ遷移を依頼したとき、Navigation API の navigate を呼び出す", ({ expect }) => {
    // Arrange
    const navigateArgs = {
      to: "/dashboard",
      history: "push" as const,
    };

    // Act
    engine.navigate(navigateArgs);

    // Assert
    expect(mockNavigation.navigate).toHaveBeenCalledWith("/dashboard", { history: "push" });
  });
});
