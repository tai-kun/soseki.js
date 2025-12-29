import type { ReadonlyFormData } from "./readonly-form-data.types.js";

/**
 * ReadonlyFormData の内容から、一時的な HTMLFormElement を生成します。
 *
 * @param formData フォーム要素に変換する元のフォームデータです。
 * @returns 生成された HTMLFormElement を返します。
 */
export default function createHtmlFormElementFormFormData(
  formData: ReadonlyFormData,
): HTMLFormElement {
  const form = document.createElement("form");
  form.style.display = "none";
  formData.forEach((value, name) => {
    const input = document.createElement("input");
    if (value instanceof File) {
      input.type = "file";
      input.name = name;
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(value);
      input.files = dataTransfer.files;
    } else {
      input.type = "hidden";
      input.name = name;
      input.value = value;
    }

    form.appendChild(input);
  });

  return form;
}
