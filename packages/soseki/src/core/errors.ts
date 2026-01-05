import { isPromiseLike } from "@tai-kun/is-promise-like";
import { type ErrorMeta, I18nErrorBase, initErrorMessage, setErrorMessage } from "i18n-error-base";
import getTypeName from "type-name";
import { type BaseIssue } from "valibot";

/***************************************************************************************************
 *
 * 型
 *
 **************************************************************************************************/

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
export class ErrorBase<TMeta extends ErrorMeta | undefined = undefined>
  extends I18nErrorBase<TMeta>
{}

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
    initErrorMessage(this, ({ meta }) => (
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
    initErrorMessage(
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
    initErrorMessage(
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
    initErrorMessage(
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
    initErrorMessage(
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
    initErrorMessage(
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
    initErrorMessage(
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
    initErrorMessage(
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
    initErrorMessage(
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
