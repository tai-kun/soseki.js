import { describe, test } from "vitest";
import { ACTION_ID_FORM_DATA_NAME } from "../../src/core/constants.js";
import getActionId from "../../src/utils/get-action-id.js";

describe("FormData にアクション ID が含まれている場合", () => {
  test("アクション ID の値が文字列として取得できるとき、その文字列を返す", ({ expect }) => {
    // Arrange
    const formData = new FormData();
    const expectedId = "test-action-id";
    formData.append(ACTION_ID_FORM_DATA_NAME, expectedId);

    // Act
    const result = getActionId(formData);

    // Assert
    expect(result).toBe(expectedId);
  });
});

describe("FormData にアクション ID が含まれていない場合", () => {
  test("指定されたキーが存在しないとき、null を返す", ({ expect }) => {
    // Arrange
    const formData = new FormData();

    // Act
    const result = getActionId(formData);

    // Assert
    expect(result).toBeNull();
  });
});

describe("FormData の値が文字列ではない場合", () => {
  test("アクション ID の値が File オブジェクトであるとき、null を返す", ({ expect }) => {
    // Arrange
    const formData = new FormData();
    const file = new File([""], "test.txt", { type: "text/plain" });
    formData.append(ACTION_ID_FORM_DATA_NAME, file);

    // Act
    const result = getActionId(formData);

    // Assert
    expect(result).toBeNull();
  });
});
