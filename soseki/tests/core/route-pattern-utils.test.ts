import { describe, test } from "vitest";

import { RoutePatternMismatchError } from "../../src/core/errors.js";
import RoutePatternUtils from "../../src/core/route-pattern-utils.js";

describe("インスタンス生成", () => {
  test("有効なルートパターンを渡したとき、正しくプロパティーが初期化される", ({ expect }) => {
    // 準備
    const routePattern = "/users/:id";

    // 実行
    const utils = new RoutePatternUtils(routePattern);

    // 検証
    expect(utils.route).toBe(routePattern);
    expect(utils.pattern).toBeInstanceOf(RegExp);
    expect(utils.paramKeys).toStrictEqual(["id"]);
  });
});

describe("match メソッド", () => {
  test("対象のパスがルートパターンに一致するとき、true を返す", ({ expect }) => {
    // 準備
    const utils = new RoutePatternUtils("/users/:id");
    const target = "/users/123";

    // 実行
    const result = utils.match(target);

    // 検証
    expect(result).toBe(true);
  });

  test("対象のパスがルートパターンに一致しないとき、false を返す", ({ expect }) => {
    // 準備
    const utils = new RoutePatternUtils("/users/:id");
    const target = "/posts/123";

    // 実行
    const result = utils.match(target);

    // 検証
    expect(result).toBe(false);
  });

  test("RoutePatternMatchURL 型のオブジェクトが渡されたとき、pathname を用いて正しく判定する", ({
    expect,
  }) => {
    // 準備
    const utils = new RoutePatternUtils("/users/:id");
    const target = { pathname: "/users/123" };

    // 実行
    const result = utils.match(target);

    // 検証
    expect(result).toBe(true);
  });

  test("allowChild オプションを true にしたとき、下位パスが存在する場合にも一致とみなす", ({
    expect,
  }) => {
    // 準備
    const utils = new RoutePatternUtils("/users/:id", { allowChild: true });
    const target = "/users/123/posts/456";

    // 実行
    const result = utils.match(target);

    // 検証
    expect(result).toBe(true);
  });
});

describe("parseSafe メソッド", () => {
  test("対象のパスがルートパターンに一致するとき、抽出されたパラメーターオブジェクトを返す", ({
    expect,
  }) => {
    // 準備
    const utils = new RoutePatternUtils("/users/:id/posts/:postId");
    const target = "/users/123/posts/456";

    // 実行
    const result = utils.parseSafe(target);

    // 検証
    expect(result).toStrictEqual({ id: "123", postId: "456" });
  });

  test("対象のパスがルートパターンに一致しないとき、null を返す", ({ expect }) => {
    // 準備
    const utils = new RoutePatternUtils("/users/:id");
    const target = "/posts/123";

    // 実行
    const result = utils.parseSafe(target);

    // 検証
    expect(result).toBe(null);
  });
});

describe("parse メソッド", () => {
  test("対象のパスがルートパターンに一致するとき、抽出されたパラメーターオブジェクトを返す", ({
    expect,
  }) => {
    // 準備
    const utils = new RoutePatternUtils("/users/:id");
    const target = "/users/123";

    // 実行
    const result = utils.parse(target);

    // 検証
    expect(result).toStrictEqual({ id: "123" });
  });

  test("対象のパスがルートパターンに一致しないとき、RoutePatternMismatchError を投げる", ({
    expect,
  }) => {
    // 準備
    const utils = new RoutePatternUtils("/users/:id");
    const target = "/posts/123";

    // 実行と検証
    expect(() => utils.parse(target)).toThrow(RoutePatternMismatchError);
  });
});

describe("inject メソッド", () => {
  test("指定されたパラメーターをルートパターンに埋め込み、パス文字列を構築する", ({ expect }) => {
    // 準備
    const utils = new RoutePatternUtils("/users/:id/posts/:postId");
    const params = { id: "123", postId: "456" };

    // 実行
    const result = utils.inject(params);

    // 検証
    expect(result).toBe("/users/123/posts/456");
  });
});

describe("replaceSafe メソッド", () => {
  test("対象のパスが一致するとき、一部のパラメーターを指定された値で上書きしたパスを構築する", ({
    expect,
  }) => {
    // 準備
    const utils = new RoutePatternUtils("/users/:id/posts/:postId");
    const target = "/users/123/posts/456";
    const params = { postId: "789" };

    // 実行
    const result = utils.replaceSafe(target, params);

    // 検証
    expect(result).toBe("/users/123/posts/789");
  });

  test("対象のパスが一致しないとき、null を返す", ({ expect }) => {
    // 準備
    const utils = new RoutePatternUtils("/users/:id");
    const target = "/posts/123";
    const params = { id: "456" };

    // 実行
    const result = utils.replaceSafe(target, params);

    // 検証
    expect(result).toBe(null);
  });
});

describe("replace メソッド", () => {
  test("対象のパスが一致するとき、一部のパラメーターを指定された値で上書きしたパスを構築する", ({
    expect,
  }) => {
    // 準備
    const utils = new RoutePatternUtils("/users/:id/posts/:postId");
    const target = "/users/123/posts/456";
    const params = { postId: "789" };

    // 実行
    const result = utils.replace(target, params);

    // 検証
    expect(result).toBe("/users/123/posts/789");
  });

  test("対象のパスが一致しないとき、RoutePatternMismatchError を投げる", ({ expect }) => {
    // 準備
    const utils = new RoutePatternUtils("/users/:id");
    const target = "/posts/123";
    const params = { id: "456" };

    // 実行と検証
    expect(() => utils.replace(target, params)).toThrow(RoutePatternMismatchError);
  });
});

describe("静的メソッド", () => {
  test("match 静的メソッドを実行したとき、正しく一致判定が行われる", ({ expect }) => {
    // 準備
    const routePattern = "/users/:id";
    const target = "/users/123";
    const options = {};

    // 実行
    const result = RoutePatternUtils.match(routePattern, target, options);

    // 検証
    expect(result).toBe(true);
  });

  test("parse 静的メソッドを実行したとき、正しくパラメーターが抽出される", ({ expect }) => {
    // 準備
    const routePattern = "/users/:id";
    const target = "/users/123";
    const options = {};

    // 実行
    const result = RoutePatternUtils.parse(routePattern, target, options);

    // 検証
    expect(result).toStrictEqual({ id: "123" });
  });

  test("parseSafe 静的メソッドを実行したとき、正しくパラメーターが抽出される", ({ expect }) => {
    // 準備
    const routePattern = "/users/:id";
    const target = "/users/123";
    const options = {};

    // 実行
    const result = RoutePatternUtils.parseSafe(routePattern, target, options);

    // 検証
    expect(result).toStrictEqual({ id: "123" });
  });

  test("inject 静的メソッドを実行したとき、正しくパスが生成される", ({ expect }) => {
    // 準備
    const routePattern = "/users/:id";
    const params = { id: "123" };
    const options = {};

    // 実行
    const result = RoutePatternUtils.inject(routePattern, params, options);

    // 検証
    expect(result).toBe("/users/123");
  });

  test("replace 静的メソッドを実行したとき、正しくパスが置換生成される", ({ expect }) => {
    // 準備
    const routePattern = "/users/:id/posts/:postId";
    const target = "/users/123/posts/456";
    const params = { postId: "789" };
    const options = {};

    // 実行
    const result = RoutePatternUtils.replace(routePattern, target, params, options);

    // 検証
    expect(result).toBe("/users/123/posts/789");
  });

  test("replaceSafe 静的メソッドを実行したとき、正しくパスが置換生成される", ({ expect }) => {
    // 準備
    const routePattern = "/users/:id/posts/:postId";
    const target = "/users/123/posts/456";
    const params = { postId: "789" };
    const options = {};

    // 実行
    const result = RoutePatternUtils.replaceSafe(routePattern, target, params, options);

    // 検証
    expect(result).toBe("/users/123/posts/789");
  });
});
