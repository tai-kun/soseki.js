import { describe, test } from "vitest";
import type { ReadonlyFormData } from "../../src/core/readonly-form-data.types.js";
import RouteRequest from "../../src/core/route-request.js";

describe("インスタンス化", () => {
  test("指定した HTTP メソッド、URL、AbortSignal、FormData で初期化した場合、それぞれのプロパティーに正しく保持される", ({ expect }) => {
    // Arrange
    const method = "POST";
    const url = new URL("https://example.com/test?b=2&a=1");
    const { signal } = new AbortController();
    const formData = new FormData() as unknown as ReadonlyFormData;

    // Act
    const actual = new RouteRequest(method, url, signal, formData);

    // Assert
    expect(actual.method).toBe(method);
    expect(actual.url).toBe(url);
    expect(actual.signal).toBe(signal);
    expect(actual.formData).toBe(formData);
  });

  test("FormData を省略して初期化した場合、formData プロパティーは null になる", ({ expect }) => {
    // Arrange
    const method = "GET";
    const url = new URL("https://example.com/");
    const { signal } = new AbortController();

    // Act
    const actual = new RouteRequest(method, url, signal);

    // Assert
    expect(actual.formData).toBeNull();
  });
});

describe("toRequest", () => {
  test("GET メソッドで Request オブジェクトを生成したとき、body が空で正しいメソッドと URL が設定される", ({ expect }) => {
    // Arrange
    const method = "GET";
    const href = "https://example.com/api";
    const url = new URL(href);
    const { signal } = new AbortController();
    const routeRequest = new RouteRequest(method, url, signal);

    // Act
    const actual = routeRequest.toRequest();

    // Assert
    expect(actual.method).toBe("GET");
    expect(actual.url).toBe(href);
    expect(actual.body).toBeNull();
    expect(actual.signal).toEqual(signal);
  });

  test("POST メソッドと FormData を指定して Request オブジェクトを生成したとき、body に FormData が設定される", async ({ expect }) => {
    // Arrange
    const method = "POST";
    const url = new URL("https://example.com/api");
    const { signal } = new AbortController();
    const formData = new FormData();
    formData.append("key", "value");
    const routeRequest = new RouteRequest(
      method,
      url,
      signal,
      formData as unknown as ReadonlyFormData,
    );

    // Act
    const actual = routeRequest.toRequest();

    // Assert
    expect(actual.method).toBe("POST");
    const actualFormData = await actual.formData();
    expect(actualFormData.get("key")).toBe("value");
  });

  test("AbortSignal を渡して Request オブジェクトを生成したとき、signal が正しく伝播される", ({ expect }) => {
    // Arrange
    const controller = new AbortController();
    const url = new URL("https://example.com/");
    const routeRequest = new RouteRequest("GET", url, controller.signal);

    // Act
    const actual = routeRequest.toRequest();

    // Assert
    expect(actual.signal.aborted).toBe(false);
    controller.abort();
    expect(actual.signal.aborted).toBe(true);
  });
});
