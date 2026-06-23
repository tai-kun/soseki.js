import { describe, test } from "vitest";

import matchRoutePath from "../../src/core/match-route-path.js";

describe("引数インターフェース形式", () => {
  test("オブジェクト形式で呼び出し、かつパターンとターゲットが完全一致するとき、 true になる", ({
    expect,
  }) => {
    // 準備
    const options = { pattern: "/user", target: "/user" };

    // 実行
    const result = matchRoutePath(options);

    // 検証
    expect(result).toBe(true);
  });

  test("オブジェクト形式で呼び出し、かつパターンとターゲットが不一致のとき、 false になる", ({
    expect,
  }) => {
    // 準備
    const options = { pattern: "/user", target: "/order" };

    // 実行
    const result = matchRoutePath(options);

    // 検証
    expect(result).toBe(false);
  });

  test("複数引数形式で呼び出し、かつパターンとターゲットが完全一致するとき、 true になる", ({
    expect,
  }) => {
    // 準備
    const pattern = "/user";
    const target = "/user";

    // 実行
    const result = matchRoutePath(pattern, target);

    // 検証
    expect(result).toBe(true);
  });

  test("複数引数形式で呼び出し、かつパターンとターゲットが不一致のとき、 false になる", ({
    expect,
  }) => {
    // 準備
    const pattern = "/user";
    const target = "/order";

    // 実行
    const result = matchRoutePath(pattern, target);

    // 検証
    expect(result).toBe(false);
  });
});

describe("対象（target）のデータ型", () => {
  test("target が文字列形式であり、かつパターンと一致するとき、 true になる", ({ expect }) => {
    // 準備
    const pattern = "/items";
    const target = "/items";

    // 実行
    const result = matchRoutePath(pattern, target);

    // 検証
    expect(result).toBe(true);
  });

  test("target が MatchRoutePathTargetURL オブジェクト形式であり、かつパターンと一致するとき、 true になる", ({
    expect,
  }) => {
    // 準備
    const pattern = "/items";
    const target = { pathname: "/items" };

    // 実行
    const result = matchRoutePath(pattern, target);

    // 検証
    expect(result).toBe(true);
  });

  test("target が MatchRoutePathTargetURL オブジェクト形式であり、かつパターンと不一致のとき、 false になる", ({
    expect,
  }) => {
    // 準備
    const pattern = "/items";
    const target = { pathname: "/sales" };

    // 実行
    const result = matchRoutePath(pattern, target);

    // 検証
    expect(result).toBe(false);
  });
});

describe("子ディレクトリー前方一致（allowChild）", () => {
  test("allowChild が未指定のとき、子パスを指定すると false になる", ({ expect }) => {
    // 準備
    const pattern = "/dashboard";
    const target = "/dashboard/settings";

    // 実行
    const result = matchRoutePath(pattern, target);

    // 検証
    expect(result).toBe(false);
  });

  test("allowChild が false のとき、子パスを指定すると false になる", ({ expect }) => {
    // 準備
    const pattern = "/dashboard";
    const target = "/dashboard/settings";
    const options = { allowChild: false };

    // 実行
    const result = matchRoutePath(pattern, target, options);

    // 検証
    expect(result).toBe(false);
  });

  test("allowChild が true のとき、完全一致するパスを指定すると true になる", ({ expect }) => {
    // 準備
    const pattern = "/dashboard";
    const target = "/dashboard";
    const options = { allowChild: true };

    // 実行
    const result = matchRoutePath(pattern, target, options);

    // 検証
    expect(result).toBe(true);
  });

  test("allowChild が true のとき、子パスを指定すると true になる", ({ expect }) => {
    // 準備
    const pattern = "/dashboard";
    const target = "/dashboard/settings";
    const options = { allowChild: true };

    // 実行
    const result = matchRoutePath(pattern, target, options);

    // 検証
    expect(result).toBe(true);
  });

  test("allowChild が true のとき、階層が深いパスを指定すると true になる", ({ expect }) => {
    // 準備
    const pattern = "/dashboard";
    const target = "/dashboard/settings/profile";
    const options = { allowChild: true };

    // 実行
    const result = matchRoutePath(pattern, target, options);

    // 検証
    expect(result).toBe(true);
  });

  test("allowChild が true のとき、部分一致するが別ディレクトリーのパスを指定すると false になる", ({
    expect,
  }) => {
    // 準備
    const pattern = "/dash";
    const target = "/dashboard";
    const options = { allowChild: true };

    // 実行
    const result = matchRoutePath(pattern, target, options);

    // 検証
    expect(result).toBe(false);
  });
});

describe("パスパラメーターおよび特殊なパスの照合", () => {
  test("ルートパス同士を照合するとき、 true になる", ({ expect }) => {
    // 準備
    const pattern = "/";
    const target = "/";

    // 実行
    const result = matchRoutePath(pattern, target);

    // 検証
    expect(result).toBe(true);
  });

  test("動的ルーティングのパスパラメーターが一致するとき、 true になる", ({ expect }) => {
    // 準備
    const pattern = "/user/:id";
    const target = "/user/123";

    // 実行
    const result = matchRoutePath(pattern, target);

    // 検証
    expect(result).toBe(true);
  });

  test("動的ルーティングのパスパラメーターにおいて、階層が不一致のとき、 false になる", ({
    expect,
  }) => {
    // 準備
    const pattern = "/user/:id";
    const target = "/user/123/edit";

    // 実行
    const result = matchRoutePath(pattern, target);

    // 検証
    expect(result).toBe(false);
  });

  test("ワイルドカードによる前方一致のとき、 true になる", ({ expect }) => {
    // 準備
    const pattern = "/public/*";
    const target = "/public/assets/index.js";

    // 実行
    const result = matchRoutePath(pattern, target);

    // 検証
    expect(result).toBe(true);
  });

  test("空文字のパスを照合するとき、正規化されて true になる", ({ expect }) => {
    // 準備
    const pattern = "";
    const target = "/";

    // 実行
    const result = matchRoutePath(pattern, target);

    // 検証
    expect(result).toBe(true);
  });
});
