import { ACTION_ID_FORM_DATA_NAME } from "../core/constants.js";

/**
 * フォームデータからアクション ID を取得します。
 *
 * @param formData 取得対象のフォームデータです。
 * @returns 取得したアクション ID を返します。文字列でない場合や存在しない場合は null を返します。
 */
export default function getActionId(formData: FormData): string | null {
  const id = formData.get(ACTION_ID_FORM_DATA_NAME);
  return typeof id === "string" ? id : null;
}
