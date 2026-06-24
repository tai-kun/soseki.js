import { describe, test } from "vitest";

import matchRoutes from "../../src/core/match-routes.js";
import RoutePatternUtils from "../../src/core/route-pattern-utils.js";

describe("正常系の振る舞い", () => {
  test("単一のルートに完全一致したとき、要素数 1 のタプル配列になる", ({ expect }) => {
    // 準備
    const utils = new RoutePatternUtils("/about");
    const routes: any = [{ utils }];
    const url = new URL("x://y" + "/about");

    // 実行
    const result = matchRoutes(routes, url);

    // 検証
    expect(result).toStrictEqual([
      {
        utils,
        params: {},
        urlPath: "/about",
      },
    ]);
  });

  test("ネストされたルートにマッチしたとき、階層的なルートがすべて抽出された要素数 2 のタプル配列になる", ({
    expect,
  }) => {
    // 準備
    const usersUtils = new RoutePatternUtils("/users", { allowChild: true });
    const usersIdUtils = new RoutePatternUtils("/users/:id");
    const routes: any = [{ utils: usersUtils }, { utils: usersIdUtils }];
    const url = new URL("x://y" + "/users/42");

    // 実行
    const result = matchRoutes(routes, url);

    // 検証
    expect(result).toStrictEqual([
      {
        utils: usersUtils,
        params: {},
        urlPath: "/users",
      },
      {
        utils: usersIdUtils,
        params: { id: "42" },
        urlPath: "/users/42",
      },
    ]);
  });

  test("複数の動的パラメーターが存在する URL にマッチしたとき、すべてのパラメーターが抽出および埋め戻しされた要素数 1 のタプル配列になる", ({
    expect,
  }) => {
    // 準備
    const utils = new RoutePatternUtils("/blogs/:posts/comments/:commentId");
    const routes: any = [{ utils }];
    const url = new URL("x://y" + "/blogs/tech/comments/123");

    // 実行
    const result = matchRoutes(routes, url);

    // 検証
    expect(result).toStrictEqual([
      {
        utils,
        params: { posts: "tech", commentId: "123" },
        urlPath: "/blogs/tech/comments/123",
      },
    ]);
  });
});

describe("異常系および特殊ケースの振る舞い", () => {
  test("登録されているどのルートにもマッチしない URL を指定したとき、null になる", ({ expect }) => {
    // 準備
    const utils = new RoutePatternUtils("/home");
    const routes: any = [{ utils }];
    const url = new URL("x://y" + "/unknown");

    // 実行
    const result = matchRoutes(routes, url);

    // 検証
    expect(result).toBe(null);
  });

  test("ルート配列が空のとき、null になる", ({ expect }) => {
    // 準備
    const routes: any = [];
    const url = new URL("x://y" + "/home");

    // 実行
    const result = matchRoutes(routes, url);

    // 検証
    expect(result).toBe(null);
  });

  test("オプショナルパラメーターが URL 側で省略されているとき、対象のパラメーターが含まれない要素数 1 のタプル配列になる", ({
    expect,
  }) => {
    // 準備
    const utils = new RoutePatternUtils("/archive/:year?");
    const routes: any = [{ utils }];
    const url = new URL("x://y" + "/archive");

    // 実行
    const result = matchRoutes(routes, url);

    // 検証
    expect(result).toStrictEqual([
      {
        utils,
        params: {},
        urlPath: "/archive",
      },
    ]);
  });

  test("末尾スラッシュの有無を考慮しない", ({ expect }) => {
    // 準備
    const utils = new RoutePatternUtils("/settings");
    const routes: any = [{ utils }];
    const url = new URL("x://y" + "/settings/");

    // 実行
    const result = matchRoutes(routes, url);

    // 検証
    expect(result).toStrictEqual([
      {
        utils,
        params: {},
        urlPath: "/settings",
      },
    ]);
  });
});
