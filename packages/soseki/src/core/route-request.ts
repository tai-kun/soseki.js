import type { ReadonlyFormData } from "./readonly-form-data.types.js";
import type { ReadonlyURL } from "./readonly-url.types.js";

/**
 * ルーティングのリクエスト情報を管理するクラスです。
 */
export default class RouteRequest {
  /**
   * HTTP メソッドです。 "GET" または "POST" のいずれかとなります。
   */
  public readonly method: "GET" | "POST";

  /**
   * リクエスト先の URL です。
   *
   * インスタンス化の際に検索パラメーターがソートされた状態で保持されます。
   */
  public readonly url: ReadonlyURL;

  /**
   * リクエストのキャンセルや中断を監視するための信号です。
   */
  public readonly signal: AbortSignal;

  /**
   * 送信されたフォームデータです。
   *
   * データが存在しない場合は `null` となります。
   */
  public readonly formData: ReadonlyFormData | null;

  /**
   * RouteRequest クラスの新しいインスタンスを初期化します。
   *
   * @param method 使用する HTTP メソッドです。
   * @param url リクエスト対象の URL オブジェクトです。
   * @param signal 処理を中断するための AbortSignal オブジェクトです。
   */
  public constructor(
    method: "GET",
    url: ReadonlyURL,
    signal: AbortSignal,
  );

  /**
   * RouteRequest クラスの新しいインスタンスを初期化します。
   *
   * @param method 使用する HTTP メソッドです。
   * @param url リクエスト対象の URL オブジェクトです。
   * @param signal 処理を中断するための AbortSignal オブジェクトです。
   * @param formData 送信するフォームデータです。
   */
  public constructor(
    method: "POST",
    url: ReadonlyURL,
    signal: AbortSignal,
    formData: ReadonlyFormData,
  );

  public constructor(
    method: "GET" | "POST",
    url: ReadonlyURL,
    signal: AbortSignal,
    formData?: ReadonlyFormData,
  ) {
    this.url = url;
    this.method = method;
    this.signal = signal;
    this.formData = formData || null;
  }

  /**
   * 現在のプロパティーを基に、標準の Request オブジェクトを生成して返します。
   *
   * @param init リクエストに適用したいカスタム設定です。
   * @returns fetch API などで使用可能な Request オブジェクトを返します。
   */
  public toRequest(init: RequestInit | undefined = {}): Request {
    const {
      body = this.formData as FormData | null,
      method = this.method,
      signal = this.signal,
      ...other
    } = init;
    return new Request(this.url.href, {
      body,
      method,
      signal,
      ...other,
    });
  }
}
