import * as v from "valibot";
import { describe, test } from "vitest";

import HistoryEntryUrlSchema from "../../src/core/history-entry-url-schema.js";

describe("インスタンス生成", () => {
  test("初回呼び出し時、スキーマオブジェクトが生成される", ({ expect }) => {
    // 準備と実行
    const schema = HistoryEntryUrlSchema();

    // 検証
    expect(schema).toBeDefined();
  });

  test("複数回呼び出し時、初回と同一のスキーマインスタンスが返される", ({ expect }) => {
    // 準備
    const firstSchema = HistoryEntryUrlSchema();

    // 実行
    const secondSchema = HistoryEntryUrlSchema();

    // 検証
    expect(secondSchema).toBe(firstSchema);
  });
});

describe("正常系", () => {
  test("クエリーパラメーターが昇順にソートされる", ({ expect }) => {
    // 準備
    const schema = HistoryEntryUrlSchema();
    const input = "https://example.com/page?c=3&a=1&b=2";

    // 実行
    const result = v.parse(schema, input);

    // 検証
    expect(result).toBeInstanceOf(URL);
    expect(result.search).toBe("?a=1&b=2&c=3");
    expect(result.href).toBe("https://example.com/page?a=1&b=2&c=3");
  });
});
