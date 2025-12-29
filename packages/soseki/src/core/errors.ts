import getTypeName from "type-name";
import { type BaseIssue, getGlobalConfig } from "valibot";
import isPromiseLike from "./_is-promise-like.js";
import singleton from "./_singleton.js";

/***************************************************************************************************
 *
 * 型
 *
 **************************************************************************************************/

/**
 * エラーのオプションです。
 */
export type ErrorOptions = Readonly<{
  /**
   * エラーの原因です。
   */
  cause?: unknown;
}>;

/**
 * エラーに紐づくメタデータです。
 */
export type ErrorMeta = {
  readonly [prop: string]: unknown;
};

/**
 * soseki におけるエラーのコンストラクターです。
 */
export interface ISosekiErrorConstructor {
  new(...args: any): ErrorBase<ErrorMeta | undefined>;
}

/**
 * 検証エラーの問題点です。
 */
export type Issue = BaseIssue<unknown>;

/***************************************************************************************************
 *
 * ユーティリティー
 *
 **************************************************************************************************/

/**
 * エラーコンストラクターと言語ごとのエラーメッセージ作成関数のマップを取得します。
 *
 * @returns エラーコンストラクターと言語ごとのエラーメッセージ作成関数のマップです。
 */
function getMessage(): WeakMap<Function | object, Map<string, (error: any) => string>> {
  return singleton("errors__message", () => new WeakMap());
}

/**
 * エラーコンストラクター内でメッセージプロパティーを初期化します。
 *
 * @template TInstance エラーオブジェクトの型です。
 * @param instance エラーオブジェクトです。
 * @param message エラーメッセージです。
 */
function initMessage<TInstance extends Error>(
  instance: TInstance,
  message: (error: TInstance) => string,
): void {
  const reference = instance.constructor;
  const { lang = "en" } = getGlobalConfig();
  const msg = getMessage();
  const store = msg.get(reference);
  const genMessage = store?.get(lang) ?? message;
  instance.message = genMessage(instance);
}

/**
 * soseki のエラーに特定の言語でエラーメッセージを設定します。
 *
 * @template TReference soseki のエラーコンストラクターの型です。
 * @param reference soseki のエラーコンストラクターです。
 * @param message エラーメッセージです。
 * @param lang 言語です。
 * @example
 * ```ts
 * setErrorMessage(
 *   TypeError,
 *   ({ meta }) => `${meta.expected} を期待しましたが、${meta.actual} を得ました`,
 *   "ja",
 * );
 * ```
 */
export function setErrorMessage<TReference extends ISosekiErrorConstructor>(
  reference: TReference,
  message: (error: InstanceType<TReference>) => string,
  lang: string,
): void {
  const msg = getMessage();
  let store = msg.get(reference);
  if (store === undefined) {
    store = new Map();
    msg.set(reference, store);
  }

  store.set(lang, message);
}

/**
 * あらゆる値を文字列に整形します。
 *
 * @param value 文字列に整形する値です。
 * @returns 文字列に整形された値です。
 */
function formatErrorValue(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/***************************************************************************************************
 *
 * エラークラス
 *
 **************************************************************************************************/

/**
 * soseki エラーの基底クラスです。
 *
 * @template TMeta エラーに紐づくメタデータです。
 */
export class ErrorBase<TMeta extends ErrorMeta | undefined = undefined> extends Error {
  /**
   * エラーのメタデータです。
   */
  public meta: Readonly<TMeta>;

  /**
   * @internal
   */
  public constructor(options: ErrorOptions | undefined, meta: TMeta) {
    super("", options);

    if (!("cause" in this) && options && "cause" in options) {
      this.cause = options.cause;
    }

    this.meta = meta;
  }
}

/**************************************************************************************************/

/**
 * 到達不能なコードに到達した場合に投げられるエラーです。
 */
export class UnreachableError extends ErrorBase<{
  /**
   * 到達しないはずの値です。
   */
  value?: unknown;
}> {
  static {
    this.prototype.name = "SosekiUnreachableError";
  }

  /**
   * `UnreachableError` クラスの新しいインスタンスを初期化します。
   *
   * @param args 到達しないはずの値があれば指定します。
   * @param options エラーのオプションです。
   */
  public constructor(args: [never?], options?: ErrorOptions | undefined) {
    super(options, args.length > 0 ? { value: args[0] } : {});
    initMessage(this, ({ meta }) => (
      "value" in meta
        ? "Encountered impossible value: " + formatErrorValue(meta.value)
        : "Unreachable code reached"
    ));
  }
}

/*#__PURE__*/ setErrorMessage(
  UnreachableError,
  ({ meta }) => (
    "value" in meta
      ? "不可能な値に遭遇しました: " + formatErrorValue(meta.value)
      : "到達できないコードに到達しました"
  ),
  "ja",
);

/**************************************************************************************************/

/**
 * 検証エラーの基底クラスです。
 *
 * @template TMeta エラーに紐づくメタデータです。
 */
export class ValidationErrorBase<TMeta extends ErrorMeta> extends ErrorBase<TMeta> {
  /**
   * @internal
   */
  public constructor(options: ErrorOptions | undefined, meta: TMeta) {
    super(options, meta);
  }
}

/**************************************************************************************************/

// /**
//  * 入力値検証エラーの基底クラスです。
//  *
//  * @template TMeta エラーに紐づくメタデータです。
//  */
// export class InvalidInputErrorBase<TMeta extends ErrorMeta> extends ValidationErrorBase<TMeta> {
//   /**
//    * @internal
//    */
//   public constructor(options: ErrorOptions | undefined, meta: TMeta) {
//     super(options, meta);
//   }
// }

/**************************************************************************************************/

// /**
//  * 入力値の検証に失敗した場合に投げられるエラーです。
//  */
// export class InvalidInputError extends InvalidInputErrorBase<{
//   /**
//    * 検証エラーの問題点です。
//    */
//   issues: [Issue, ...Issue[]];

//   /**
//    * 検証した入力値です。
//    */
//   input: unknown;
// }> {
//   static {
//     this.prototype.name = "SosekiInvalidInputError";
//   }

//   /**
//    * `InvalidInputError` クラスの新しいインスタンスを初期化します。
//    *
//    * @param issues 検証エラーの問題点です。
//    * @param input 検証した入力値です。
//    * @param options エラーのオプションです。
//    */
//   public constructor(
//     issues: [Issue, ...Issue[]],
//     input: unknown,
//     options?: ErrorOptions | undefined,
//   ) {
//     super(options, { issues, input });
//     this.message = issues.map(issue => issue.message).join(": ");
//   }
// }

/**************************************************************************************************/

/**
 * 予期しない値に遭遇した場合に投げられるエラーです。
 */
export class UnexpectedValidationError extends ValidationErrorBase<{
  /**
   * 検証エラーの問題点です。
   */
  issues: [Issue, ...Issue[]];

  /**
   * 予期しない値です。
   */
  value: unknown;
}> {
  static {
    this.prototype.name = "SosekiUnexpectedValidationError";
  }

  /**
   * `UnexpectedValidationError` クラスの新しいインスタンスを初期化します。
   *
   * @param issues 検証エラーの問題点です。
   * @param value 予期しない値です。
   * @param options エラーのオプションです。
   */
  public constructor(
    issues: [Issue, ...Issue[]],
    value: unknown,
    options?: ErrorOptions | undefined,
  ) {
    super(options, { issues, value });
    this.message = issues.map(issue => issue.message).join(": ");
  }
}

/**************************************************************************************************/

/**
 * shouldAction が不正な値を返した場合に投げられるエラーです。
 */
export class ActionConditionError extends ErrorBase<{
  /**
   * ルートの URL です。
   */
  url: string;

  /**
   * shouldAction 関数です。
   */
  shouldAction: Function;

  /**
   * shouldAction が返した値です。
   */
  returnValue: unknown;
}> {
  static {
    this.prototype.name = "SosekiActionConditionError";
  }

  /**
   * `ActionConditionError` クラスの新しいインスタンスを初期化します。
   *
   * @param url ルートの URL です。
   * @param shouldAction shouldAction 関数です。
   * @param returnValue shouldAction が返した値です。
   * @param options エラーのオプションです。
   */
  public constructor(
    url: string,
    shouldAction: Function,
    returnValue: unknown,
    options?: ErrorOptions | undefined,
  ) {
    super(options, {
      url,
      returnValue,
      shouldAction,
    });
    initMessage(
      this,
      ({ meta }) =>
        isPromiseLike(meta.returnValue)
          ? "shouldAction must return a boolean value synchronously"
          : `Expected boolean, but got ${getTypeName(meta.returnValue) || "unknown"}`,
    );
  }
}

/*#__PURE__*/ setErrorMessage(
  ActionConditionError,
  ({ meta }) =>
    isPromiseLike(meta.returnValue)
      ? "shouldAction は同期的に真偽値を返す必要があります"
      : `真偽値を期待しましたが、${getTypeName(meta.returnValue) || "unknown"} を得ました`,
  "ja",
);

/**************************************************************************************************/

/**
 * 1 つ以上のアクションが失敗した際に投げられるエラーです。
 */
export class ActionExecutionError extends ErrorBase<{
  /**
   * ルートの URL です。
   */
  url: string;

  /**
   * エラーのリストです。
   */
  errors: readonly {
    /**
     * action 関数です。
     */
    readonly action: Function;

    /**
     * エラーの原因です。
     */
    readonly reason: unknown;
  }[];
}> {
  static {
    this.prototype.name = "SosekiActionExecutionError";
  }

  /**
   * `ActionExecutionError` クラスの新しいインスタンスを初期化します。
   *
   * @param url ルートの URL です。
   * @param errors エラーのリストです。
   * @param options エラーのオプションです。
   */
  public constructor(
    url: string,
    errors: readonly {
      /**
       * action 関数です。
       */
      action: Function;

      /**
       * エラーの原因です。
       */
      reason: unknown;
    }[],
    options?: ErrorOptions | undefined,
  ) {
    super(options, {
      url,
      errors,
    });
    initMessage(
      this,
      ({ meta }) => `Errors occurred in ${meta.errors.length} action(s)`,
    );
  }
}

/*#__PURE__*/ setErrorMessage(
  ActionExecutionError,
  ({ meta }) => `${meta.errors.length} 個のアクションでエラーが発生しました。`,
  "ja",
);

/**************************************************************************************************/

/**
 * 複数のアクションからリダイレクトが返された際に投げられるエラーです。
 */
export class MultipleRedirectError extends ErrorBase<{
  /**
   * ルートの URL です。
   */
  url: string;

  /**
   * 検出されたリダイレクト先パスのリストです。
   */
  redirects: readonly string[];
}> {
  static {
    this.prototype.name = "SosekiMultipleRedirectError";
  }

  /**
   * `MultipleRedirectError` クラスの新しいインスタンスを初期化します。
   *
   * @param url ルートの URL です。
   * @param redirects リダイレクト先パスのリストです。
   * @param options エラーのオプションです。
   */
  public constructor(
    url: string,
    redirects: readonly string[],
    options?: ErrorOptions | undefined,
  ) {
    super(options, {
      url,
      redirects,
    });
    initMessage(
      this,
      ({ meta }) => `Multiple redirects detected: ${meta.redirects.join(", ")}`,
    );
  }
}

/*#__PURE__*/ setErrorMessage(
  MultipleRedirectError,
  ({ meta }) => `複数のリダイレクトが検出されました: ${meta.redirects.join(", ")}`,
  "ja",
);

/**************************************************************************************************/

/**
 * shouldLoader が不正な値を返した場合に投げられるエラーです。
 */
export class LoaderConditionError extends ErrorBase<{
  /**
   * ルートの URL です。
   */
  url: string;

  /**
   * shouldLoader 関数です。
   */
  shouldLoader: Function;

  /**
   * shouldLoader が返した値です。
   */
  returnValue: unknown;
}> {
  static {
    this.prototype.name = "SosekiLoaderConditionError";
  }

  /**
   * `LoaderConditionError` クラスの新しいインスタンスを初期化します。
   *
   * @param url ルートの URL です。
   * @param shouldLoader shouldLoader 関数です。
   * @param returnValue shouldLoader が返した値です。
   * @param options エラーのオプションです。
   */
  public constructor(
    url: string,
    shouldLoader: Function,
    returnValue: unknown,
    options?: ErrorOptions | undefined,
  ) {
    super(options, {
      url,
      returnValue,
      shouldLoader,
    });
    initMessage(
      this,
      ({ meta }) =>
        isPromiseLike(meta.returnValue)
          ? "shouldLoader must return a boolean value synchronously"
          : `Expected boolean, but got ${getTypeName(meta.returnValue) || "unknown"}`,
    );
  }
}

/*#__PURE__*/ setErrorMessage(
  LoaderConditionError,
  ({ meta }) =>
    isPromiseLike(meta.returnValue)
      ? "shouldLoader は同期的に真偽値を返す必要があります"
      : `真偽値を期待しましたが、${getTypeName(meta.returnValue) || "unknown"} を得ました`,
  "ja",
);

/**************************************************************************************************/

/**
 * Navigation API が現在の環境でサポートされていない場合に投げられるエラーです。
 */
export class NavigationApiNotSupportedError extends ErrorBase<{
  /**
   * 現在のブラウザの UserAgent です。
   */
  userAgent: string;
}> {
  static {
    this.prototype.name = "SosekiNavigationApiNotSupportedError";
  }

  /**
   * `NavigationApiNotSupportedError` クラスの新しいインスタンスを初期化します。
   *
   * @param options エラーのオプションです。
   */
  public constructor(options?: ErrorOptions | undefined) {
    super(options, {
      userAgent: typeof window !== "undefined"
        ? window.navigator.userAgent
        : "unknown",
    });
    initMessage(
      this,
      () => "The Navigation API is not supported in this environment",
    );
  }
}

/*#__PURE__*/ setErrorMessage(
  NavigationApiNotSupportedError,
  () => "現在の環境では Navigation API がサポートされていません",
  "ja",
);

/**************************************************************************************************/

/**
 * RouteContext が供給されていない場合に投げられるエラーです。
 */
export class RouteContextMissingError extends ErrorBase<undefined> {
  static {
    this.prototype.name = "SosekiRouteContextMissingError";
  }

  /**
   * `RouteContextMissingError` クラスの新しいインスタンスを初期化します。
   *
   * @param options エラーのオプションです。
   */
  public constructor(options?: ErrorOptions | undefined) {
    // メタデータは不要なため undefined を渡す
    super(options, undefined);
    initMessage(
      this,
      () => "RouteContext not found. Did you forget to wrap your app in <Router />?",
    );
  }
}

/*#__PURE__*/ setErrorMessage(
  RouteContextMissingError,
  () => "RouteContext が見つかりません。アプリを <Router /> で囲むのを忘れていませんか？",
  "ja",
);

/**************************************************************************************************/

/**
 * RouterContext が供給されていない場合に投げられるエラーです。
 */
export class RouterContextMissingError extends ErrorBase<undefined> {
  static {
    this.prototype.name = "SosekiRouterContextMissingError";
  }

  /**
   * `RouterContextMissingError` クラスの新しいインスタンスを初期化します。
   *
   * @param options エラーのオプションです。
   */
  public constructor(options?: ErrorOptions | undefined) {
    // メタデータは不要なため undefined を渡す
    super(options, undefined);
    initMessage(
      this,
      () => "RouterContext not found. Did you forget to wrap your app in <Router />?",
    );
  }
}

/*#__PURE__*/ setErrorMessage(
  RouterContextMissingError,
  () => "RouterContext が見つかりません。アプリを <Router /> で囲むのを忘れていませんか？",
  "ja",
);

/**************************************************************************************************/

/**
 * ローダーに紐づくデータが見つからない場合に投げられるエラーです。
 */
export class LoaderDataNotFoundError extends ErrorBase<{
  /**
   * データが見つからなかった loader 関数です。
   */
  loader: Function;
}> {
  static {
    this.prototype.name = "SosekiLoaderDataNotFoundError";
  }

  /**
   * `LoaderDataNotFoundError` クラスの新しいインスタンスを初期化します。
   *
   * @param loader データが見つからなかった loader 関数です。
   * @param options エラーのオプションです。
   */
  public constructor(
    loader: Function,
    options?: ErrorOptions | undefined,
  ) {
    super(options, { loader });
    initMessage(
      this,
      ({ meta }) => `Loader data not found (Loader: ${meta.loader.name || "anonymous"})`,
    );
  }
}

/*#__PURE__*/ setErrorMessage(
  LoaderDataNotFoundError,
  ({ meta }) => `ローダーデータが見つかりません（Loader: ${meta.loader.name || "匿名"}）`,
  "ja",
);
