import { test } from "vitest";
import actionIdRegistry from "../../src/core/_action-id-registry.js";
import { ACTION_ID_FORM_DATA_NAME } from "../../src/core/constants.js";
import type { IAction } from "../../src/core/route.types.js";
import setActionId from "../../src/utils/set-action-id.js";

test("アクション関数を渡したとき、発行されたアクション ID が FormData に設定される", ({ expect }) => {
  // Arrange
  const formData = new FormData();
  const action: IAction = async () => new Response();

  // Act
  setActionId(formData, action);

  // Assert
  // レジストリから発行されたはずの ID を取得して検証する
  const expectedId = actionIdRegistry.set(action);
  const actualId = formData.get(ACTION_ID_FORM_DATA_NAME);

  expect(actualId).toBe(expectedId);
});

test("既にデータが存在する FormData に対して実行したとき、アクション ID が上書きされる", ({ expect }) => {
  // Arrange
  const formData = new FormData();
  formData.set(ACTION_ID_FORM_DATA_NAME, "old-id");
  const action: IAction = async () => new Response();

  // Act
  setActionId(formData, action);

  // Assert
  const actualId = formData.get(ACTION_ID_FORM_DATA_NAME);
  expect(actualId).not.toBe("old-id");
  expect(typeof actualId).toBe("string");
});
