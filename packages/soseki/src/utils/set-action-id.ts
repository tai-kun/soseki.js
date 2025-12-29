import actionIdRegistry from "../core/_action-id-registry.js";
import { ACTION_ID_FORM_DATA_NAME } from "../core/constants.js";
import type { IAction } from "../core/route.types.js";

/**
 * フォームデータに対してアクション ID を発行し、設定します。
 *
 * @param formData アクション ID を設定する対象のフォームデータです。
 * @param action アクション関数です。
 */
export default function setActionId(formData: FormData, action: IAction): void {
  const id = actionIdRegistry.set(action);
  formData.set(ACTION_ID_FORM_DATA_NAME, id);
}
