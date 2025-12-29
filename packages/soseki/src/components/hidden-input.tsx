import * as React from "react";

/**
 * 隠し入力フィールド（hidden input）のプロパティーを定義する型です。
 */
export type HiddenInputProps = {
  /**
   * フォーム送信時に使用される要素の名前です。
   */
  name: string;

  /**
   * フォーム送信時に送信される値です。
   */
  value: string;
};

/**
 * フォーム内で非表示の状態を保持するための隠し入力コンポーネントです。
 */
export default /*#__PURE__*/ React.memo(
  function HiddenInput(props: HiddenInputProps) {
    const {
      name,
      value,
    } = props;

    return (
      <input
        type="hidden"
        name={name}
        style={{ display: "none" }}
        value={value}
        hidden
      />
    );
  },
  (a, b) => a.name === b.name && a.value === b.value,
);
