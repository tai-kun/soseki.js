import { test, describe } from "vitest";

import matchPath from "../../src/core/_match-route-path.js";

describe("正常系テスト（マッチング成功）", () => {
  test("パラメーターなしの完全一致のパスである場合、空の params を含むオブジェクトを返す", ({
    expect,
  }) => {
    // 準備
    const route = {
      pathPattern: /^\/about$/,
      paramKeys: [],
    };
    const url = new URL("x://y" + "/about");

    // 実行
    const result = matchPath(route, url);

    // 検証
    expect(result).toStrictEqual({
      params: {},
    });
  });

  test("単一のパラメーターを含むパスから値を抽出する場合、指定されたキーと値を含むオブジェクトを返す", ({
    expect,
  }) => {
    // 準備
    const route = {
      pathPattern: /^\/users\/([^/]+)$/,
      paramKeys: ["id"],
    };
    const url = new URL("x://y" + "/users/123");

    // 実行
    const result = matchPath(route, url);

    // 検証
    expect(result).toStrictEqual({
      params: {
        id: "123",
      },
    });
  });

  test("複数のパラメーターを含むパスから値を抽出する場合、すべてのキーと値を含むオブジェクトを返す", ({
    expect,
  }) => {
    // 準備
    const route = {
      pathPattern: /^\/posts\/([^/]+)\/comments\/([^/]+)$/,
      paramKeys: ["postId", "commentId"],
    };
    const url = new URL("x://y" + "/posts/abc/comments/def");

    // 実行
    const result = matchPath(route, url);

    // 検証
    expect(result).toStrictEqual({
      params: {
        postId: "abc",
        commentId: "def",
      },
    });
  });
});

describe("正常系テスト（マッチング失敗）", () => {
  test("パスがパターンに一致しない場合、null を返す", ({ expect }) => {
    // 準備
    const route = {
      pathPattern: /^\/about$/,
      paramKeys: [],
    };
    const url = new URL("x://y" + "/contact");

    // 実行
    const result = matchPath(route, url);

    // 検証
    expect(result).toBe(null);
  });

  test("パスが前方一致するが完全一致しない場合、null を返す", ({ expect }) => {
    // 準備
    const route = {
      pathPattern: /^\/user\/([^/]+)$/,
      paramKeys: ["id"],
    };
    const url = new URL("x://y" + "/user/123/profile");

    // 実行
    const result = matchPath(route, url);

    // 検証
    expect(result).toBe(null);
  });
});

describe("境界値・特殊ケーステスト", () => {
  describe("空文字および特殊文字のハンドリング", () => {
    test("ルートパスへのアクセスである場合、空の params を含むオブジェクトを返す", ({ expect }) => {
      // 準備
      const route = {
        pathPattern: /^\/$/,
        paramKeys: [],
      };
      const url = new URL("x://y" + "/");

      // 実行
      const result = matchPath(route, url);

      // 検証
      expect(result).toStrictEqual({
        params: {},
      });
    });

    test("パラメーター値が空文字である場合、空文字の値をそのまま格納したオブジェクトを返す", ({
      expect,
    }) => {
      // 準備
      const route = {
        pathPattern: /^\/search\/(.*)$/,
        paramKeys: ["query"],
      };
      const url = new URL("x://y" + "/search/");

      // 実行
      const result = matchPath(route, url);

      // 検証
      expect(result).toStrictEqual({
        params: {
          query: "",
        },
      });
    });

    test("パラメーター値に URL エンコードされた文字列が含まれる場合、デコードせずにそのまま格納したオブジェクトを返す", ({
      expect,
    }) => {
      // 準備
      const route = {
        pathPattern: /^\/tags\/([^/]+)$/,
        paramKeys: ["tagName"],
      };
      const url = new URL("x://y" + "/tags/%E3%83%86%E3%82%B9%E3%83%88");

      // 実行
      const result = matchPath(route, url);

      // 検証
      expect(result).toStrictEqual({
        params: {
          tagName: "%E3%83%86%E3%82%B9%E3%83%88",
        },
      });
    });
  });

  describe("オプショナルパラメーターおよび不一致の制御", () => {
    test("オプショナルパラメーターが省略された場合、undefined となったセグメントを除外したオブジェクトを返す", ({
      expect,
    }) => {
      // 準備
      const route = {
        pathPattern: /^\/archive(?:\/([^/]+))?$/,
        paramKeys: ["year"],
      };
      const url = new URL("x://y" + "/archive");

      // 実行
      const result = matchPath(route, url);

      // 検証
      expect(result).toStrictEqual({
        params: {},
      });
    });

    test("オプショナルパラメーターが指定された場合、その値を抽出したオブジェクトを返す", ({
      expect,
    }) => {
      // 準備
      const route = {
        pathPattern: /^\/archive(?:\/([^/]+))?$/,
        paramKeys: ["year"],
      };
      const url = new URL("x://y" + "/archive/2026");

      // 実行
      const result = matchPath(route, url);

      // 検証
      expect(result).toStrictEqual({
        params: {
          year: "2026",
        },
      });
    });

    test("paramKeys の定義数がキャプチャーグループ数より多い場合、値が存在しないキーを除外したオブジェクトを返す", ({
      expect,
    }) => {
      // 準備
      const route = {
        pathPattern: /^\/page\/([^/]+)$/,
        paramKeys: ["id", "extraKey"],
      };
      const url = new URL("x://y" + "/page/home");

      // 実行
      const result = matchPath(route, url);

      // 検証
      expect(result).toStrictEqual({
        params: {
          id: "home",
        },
      });
    });

    test("キャプチャーグループ数が paramKeys の定義数より多い場合、定義数を超えたグループを無視したオブジェクトを返す", ({
      expect,
    }) => {
      // 準備
      const route = {
        pathPattern: /^\/blog\/([^/]+)\/([^/]+)$/,
        paramKeys: ["category"],
      };
      const url = new URL("x://y" + "/blog/tech/js");

      // 実行
      const result = matchPath(route, url);

      // 検証
      expect(result).toStrictEqual({
        params: {
          category: "tech",
        },
      });
    });
  });
});
