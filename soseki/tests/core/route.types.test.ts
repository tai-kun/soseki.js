import { describe, test, expectTypeOf } from "vitest";

import type { RoutePathParams } from "../../src/core/route.types.js";

describe("RoutePathParams", () => {
  test("パラメーターを正しく推論できる", () => {
    expectTypeOf({} as RoutePathParams<"/leagues/:routeId/:slugStr?/:subPage?">).toEqualTypeOf<{
      readonly routeId: string;
      readonly slugStr?: string;
      readonly subPage?: string;
    }>();
    expectTypeOf({} as RoutePathParams<"/foo/:bar.mp4">).toEqualTypeOf<{
      readonly bar: string;
    }>();
    expectTypeOf({} as RoutePathParams<"/foo/bar:action">).toEqualTypeOf<{}>();
    expectTypeOf({} as RoutePathParams).toEqualTypeOf<{
      readonly [x: string]: string | undefined;
    }>();
  });
});
