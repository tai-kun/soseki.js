import WeakIdRegistry from "./_weak-id-registry.js";
import type { IAction } from "./route.types.js";

/**
 * `IAction` 型のオブジェクトとその識別子を管理するための、弱い参照を用いたレジストリーです。
 *
 * ガベージコレクションを妨げずにアクションの識別子を保持するために使用されます。
 */
const actionIdRegistry = new WeakIdRegistry<IAction>();

export default actionIdRegistry;
