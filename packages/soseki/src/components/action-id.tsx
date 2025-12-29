import * as React from "react";
import actionIdRegistry from "../core/_action-id-registry.js";
import { ACTION_ID_FORM_DATA_NAME } from "../core/constants.js";
import type { IAction } from "../core/route.types.js";
import HiddenInput from "./hidden-input.jsx";

/**
 * ActionId コンポーネントのプロパティーを定義する型です。
 */
export type ActionIdProps = {
  /**
   * 実行対象となるアクション関数です。
   */
  action: IAction;
};

/**
 * アクションに対応する識別子を隠しフィールドとしてレンダリングするコンポーネントです。
 *
 * アクション関数をレジストリーに登録し、発行された ID をフォームデータとして送信可能な状態にします。
 */
export default /*#__PURE__*/ React.memo(
  function ActionId(props: ActionIdProps): React.ReactElement {
    const { action } = props;
    const id = actionIdRegistry.set(action);

    return (
      <HiddenInput
        name={ACTION_ID_FORM_DATA_NAME}
        value={id}
      />
    );
  },
  (a, b) => a.action === b.action,
);
