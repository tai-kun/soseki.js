import { test } from "vitest";
import matchRoutes from "../../src/core/match-routes.js";
import type { Route } from "../../src/core/route.types.js";

test("指定したパス名がどのルートにもマッチしないとき、null を返す", ({ expect }) => {
  // Arrange
  const routes: Route[] = [
    {
      path: "/home",
      pathPattern: /^\/home\/?$/i,
      paramKeys: [],
      index: true,
      dataFuncs: [],
      component: () => null,
      children: [],
    },
  ];

  // Act
  const result = matchRoutes(routes, "/about");

  // Assert
  expect(result).toBeNull();
});

test("単一のルートにマッチしたとき、そのルートの属性と抽出されたパラメーターを返す", ({ expect }) => {
  // Arrange
  const routes: Route[] = [
    {
      path: "/user/:id",
      pathPattern: /^\/user\/([^/]+?)\/?$/i,
      paramKeys: ["id"],
      index: true,
      dataFuncs: [],
      component: () => null,
      children: [],
    },
  ];

  // Act
  const result = matchRoutes(routes, "/user/123");

  // Assert
  expect(result).toHaveLength(1);
  expect(result![0].path).toBe("/user/:id");
  expect(result![0].index).toBe(true);
  expect(result![0].params).toStrictEqual({ id: "123" });
  expect(result![0].urlPath).toBe("/user/123");
});

test("パスパターンよりネストされたルートにマッチしたとき、urlPath はパスパターンまでの情報のみを保持する", ({ expect }) => {
  // Arrange
  const routes: Route[] = [
    {
      path: "/user/:id",
      pathPattern: /^\/user\/([^/]+?)(?:\/.*)?$/i,
      paramKeys: ["id"],
      index: false,
      dataFuncs: [],
      component: () => null,
      children: [],
    },
  ];

  // Act
  const result = matchRoutes(routes, "/user/123/setting");

  // Assert
  expect(result).toHaveLength(1);
  expect(result![0].path).toBe("/user/:id");
  expect(result![0].index).toBe(false);
  expect(result![0].params).toStrictEqual({ id: "123" });
  expect(result![0].urlPath).toBe("/user/123");
});

test("ネストされたルートにマッチしたとき、子から親への階層構造を保持した配列を返す", ({ expect }) => {
  // Arrange
  const childRoute: Route = {
    path: "/parent/child",
    pathPattern: /^\/parent\/child\/?$/i,
    paramKeys: [],
    index: true,
    dataFuncs: [],
    component: () => "Child",
    children: [],
  };

  const parentRoute: Route = {
    path: "/parent",
    pathPattern: /^\/parent(?:\/.*)?$/i,
    paramKeys: [],
    index: false,
    dataFuncs: [],
    component: () => "Parent",
    children: [childRoute],
  };

  const routes = [parentRoute];

  // Act
  const result = matchRoutes(routes, "/parent/child");

  // Assert
  expect(result).toHaveLength(2);
  expect(result![0].path).toBe("/parent/child");
  expect(result![0].index).toBe(true);
  expect(result![0].urlPath).toBe("/parent/child");
  expect(result![1]!.path).toBe("/parent");
  expect(result![1]!.path).toBe("/parent");
  expect(result![1]!.urlPath).toBe("/parent");
});

test("複数のルート定義があるとき、最初にマッチしたルートの結果を返す", ({ expect }) => {
  // Arrange
  const routes: Route[] = [
    {
      path: "/a",
      pathPattern: /^\/a\/?$/i,
      paramKeys: [],
      index: true,
      dataFuncs: [],
      component: () => "A",
      children: [],
    },
    {
      path: "/:id",
      pathPattern: /^\/([^/]+?)\/?$/i,
      paramKeys: ["id"],
      index: true,
      dataFuncs: [],
      component: () => "Dynamic",
      children: [],
    },
  ];

  // Act
  const result1 = matchRoutes(routes, "/a");
  const result2 = matchRoutes(routes.toReversed(), "/a");

  // Assert
  expect(result1).toHaveLength(1);
  expect(result1![0].path).toBe("/a");
  expect(result2).toHaveLength(1);
  expect(result2![0].path).toBe("/:id");
});

test("親ルートはマッチするが子ルートのいずれにもマッチしないとき、親ルートのみを含む配列を返す", ({ expect }) => {
  // Arrange
  const childRoute: Route = {
    path: "/parent/child",
    pathPattern: /^\/parent\/child\/?$/i,
    paramKeys: [],
    index: true,
    dataFuncs: [],
    component: () => "Child",
    children: [],
  };

  const parentRoute: Route = {
    path: "/parent",
    pathPattern: /^\/parent(?:\/.*)?$/i,
    paramKeys: [],
    index: false,
    dataFuncs: [],
    component: () => "Parent",
    children: [childRoute],
  };

  const routes = [parentRoute];

  // Act
  const result = matchRoutes(routes, "/parent/other");

  // Assert
  expect(result).toHaveLength(1);
  expect(result![0].path).toBe("/parent");
  expect(result![0].index).toBe(false);
});
