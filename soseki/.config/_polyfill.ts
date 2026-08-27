// WebKit (JavaScriptCore) など `Symbol.dispose` を実装していないブラウザーのためのポリフィルです。
// これが欠けていると、vitest のモックを `using` 構文で解放する際に "Object is not disposable" エラーが発生します。
if (typeof Symbol.dispose !== "symbol") {
  Object.defineProperty(Symbol, "dispose", {
    value: Symbol("Symbol.dispose"),
    configurable: false,
    writable: false,
    enumerable: false,
  });
}
