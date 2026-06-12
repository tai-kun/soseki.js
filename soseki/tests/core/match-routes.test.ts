import { describe, test } from "vitest";

import matchRoutes from "../../src/core/match-routes.js";

describe("正常系の振る舞い", () => {
  test("単一のルートに完全一致したとき、要素数 1 のタプル配列になる", ({ expect }) => {
    // 準備
    const routes: any = [
      {
        path: "/about",
        pathPattern: /^\/about$/,
        paramKeys: [],
      },
    ];
    const url = new URL("x://y" + "/about");

    // 実行
    const result = matchRoutes(routes, url);

    // 検証
    expect(result).toStrictEqual([
      {
        path: "/about",
        pathPattern: /^\/about$/,
        paramKeys: [],
        params: {},
        urlPath: "/about",
      },
    ]);
  });

  test("ネストされたルートにマッチしたとき、階層的なルートがすべて抽出された要素数 2 のタプル配列になる", ({
    expect,
  }) => {
    // 準備
    const routes: any = [
      {
        path: "/users",
        pathPattern: /^\/users/,
        paramKeys: [],
      },
      {
        path: "/users/:id",
        pathPattern: /^\/users\/([^/]+)/,
        paramKeys: ["id"],
      },
    ];
    const url = new URL("x://y" + "/users/42");

    // 実行
    const result = matchRoutes(routes, url);

    // 検証
    expect(result).toStrictEqual([
      {
        path: "/users",
        pathPattern: /^\/users/,
        paramKeys: [],
        params: {},
        urlPath: "/users",
      },
      {
        path: "/users/:id",
        pathPattern: /^\/users\/([^/]+)/,
        paramKeys: ["id"],
        params: { id: "42" },
        urlPath: "/users/42",
      },
    ]);
  });

  test("複数の動的パラメーターが存在する URL にマッチしたとき、すべてのパラメーターが抽出および埋め戻しされた要素数 1 のタプル配列になる", ({
    expect,
  }) => {
    // 準備
    const routes: any = [
      {
        path: "/blogs/:posts/comments/:commentId",
        pathPattern: /^\/blogs\/([^/]+)\/comments\/([^/]+)$/,
        paramKeys: ["posts", "commentId"],
      },
    ];
    const url = new URL("x://y" + "/blogs/tech/comments/123");

    // 実行
    const result = matchRoutes(routes, url);

    // 検証
    expect(result).toStrictEqual([
      {
        path: "/blogs/:posts/comments/:commentId",
        pathPattern: /^\/blogs\/([^/]+)\/comments\/([^/]+)$/,
        paramKeys: ["posts", "commentId"],
        params: { posts: "tech", commentId: "123" },
        urlPath: "/blogs/tech/comments/123",
      },
    ]);
  });
});

describe("異常系および特殊ケースの振る舞い", () => {
  test("登録されているどのルートにもマッチしない URL を指定したとき、null になる", ({ expect }) => {
    // 準備
    const routes: any = [
      {
        path: "/home",
        pathPattern: /^\/home$/,
        paramKeys: [],
      },
    ];
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
    const routes: any = [
      {
        path: "/archive/:year?",
        pathPattern: /^\/archive(?:\/([^/]+))?$/,
        paramKeys: ["year"],
      },
    ];
    const url = new URL("x://y" + "/archive");

    // 実行
    const result = matchRoutes(routes, url);

    // 検証
    expect(result).toStrictEqual([
      {
        path: "/archive/:year?",
        pathPattern: /^\/archive(?:\/([^/]+))?$/,
        paramKeys: ["year"],
        params: {},
        urlPath: "/archive",
      },
    ]);
  });

  test("末尾スラッシュの有無により不一致となる URL を指定したとき、null になる", ({ expect }) => {
    // 準備
    const routes: any = [
      {
        path: "/settings",
        pathPattern: /^\/settings$/,
        paramKeys: [],
      },
    ];
    const url = new URL("x://y" + "/settings/");

    // 実行
    const result = matchRoutes(routes, url);

    // 検証
    expect(result).toBe(null);
  });
});
