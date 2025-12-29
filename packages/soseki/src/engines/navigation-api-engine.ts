import actionIdRegistry from "../core/_action-id-registry.js";
import createHtmlFormElementFormFormData from "../core/_create-html-form-element-form-form-data.js";
import * as v from "../core/_valibot.js";
import { ACTION_ID_FORM_DATA_NAME } from "../core/constants.js";
import { NavigationApiNotSupportedError } from "../core/errors.js";
import expectHistoryEntry from "../core/expect-history-entry.js";
import HistoryEntryIdSchema, { type HistoryEntryId } from "../core/history-entry-id-schema.js";
import HistoryEntryUrlSchema from "../core/history-entry-url-schema.js";
import initLoaders from "../core/init-loaders.js";
import matchRoutes from "../core/match-routes.js";
import type { IAction } from "../core/route.types.js";
import startActions from "../core/start-actions.js";
import startLoaders from "../core/start-loaders.js";
import type {
  IEngine,
  InitEngineArgs,
  NavigateArgs,
  RouterState,
  StartEngineArgs,
  SubmitArgs,
} from "./engine.types.js";

/**
 * Navigation API を利用してルーティングの基幹処理を行うエンジンクラスです。
 */
export default class NavigationApiEngine implements IEngine {
  /**
   * Navigation API の実体です。
   */
  private nav: Navigation;

  /**
   * すでにイベントリスナーを登録済みのエントリー ID を管理するセットです。
   */
  private subscribedEntryIds: Set<HistoryEntryId>;

  /**
   * 実行中のナビゲーションをキャンセルするためのコントローラーです。
   */
  private navAbortController: AbortController | null;

  /**
   * NavigationApiEngine クラスの新しいインスタンスを初期化します。
   */
  public constructor() {
    let nav: Navigation | undefined;
    try {
      nav = navigation;
    } catch {
      try {
        nav = window.navigation;
      } catch {}
    }
    // オブジェクトの存在確認を行い、非対応環境なら例外を投げます。
    if (!(nav && typeof nav === "object")) {
      throw new NavigationApiNotSupportedError();
    }

    this.nav = nav;
    this.subscribedEntryIds = new Set();
    this.navAbortController = null;
  }

  /**
   * 現在のロケーションに基づいた初期のルーター状態を生成します。
   *
   * @param args 状態生成に必要なルート定義やデータ保持用のマップです。
   * @returns 生成されたルーター状態、またはマッチしなかった場合は `null` を返します。
   */
  public init(args: InitEngineArgs): RouterState | null {
    const currentEntry = expectHistoryEntry(this.nav.currentEntry);
    if (!currentEntry) {
      return null;
    }

    const {
      routes,
      getSignal,
      loaderDataStore,
    } = args;
    const currentRoutes = matchRoutes(routes, currentEntry.url.pathname);
    if (!currentRoutes) {
      return null;
    }

    // 非同期でローダーの初期化を開始します。
    initLoaders({
      entry: currentEntry,
      routes: currentRoutes,
      signal: getSignal(),
      dataStore: loaderDataStore,
    });

    return {
      entry: currentEntry,
      routes: currentRoutes,
    };
  }

  /**
   * エンジンの動作を開始し、ナビゲーションイベントの監視を行います。
   *
   * @param args エンジンの開始に必要な設定とデータ管理用のオブジェクトです。
   */
  public start(args: StartEngineArgs): void {
    const {
      routes,
      update,
      getSignal,
      actionDataStore,
      loaderDataStore,
    } = args;

    /**
     * ナビゲーションが発生した際のハンドラーです。
     *
     * @param event ナビゲーションイベントです。
     */
    const handleNavigate = (event: NavigateEvent): void => {
      // インターセプトできない場合や、ハッシュ変更、ダウンロードリクエストの場合は処理をスキップします。
      // 参照: https://developer.mozilla.org/docs/Web/API/Navigation_API#handling_a_navigation_using_intercept
      if (
        !event.isTrusted
        || !event.canIntercept
        || event.hashChange
        || event.downloadRequest !== null
      ) {
        return;
      }

      const currentEntry = expectHistoryEntry(this.nav.currentEntry);
      if (!currentEntry) {
        event.intercept({
          async handler() {
            update(null);
          },
        });
        return;
      }

      const destUrl = v.expect(HistoryEntryUrlSchema(), event.destination.url);
      const destRoutes = matchRoutes(routes, destUrl.pathname);
      if (!destRoutes) {
        event.intercept({
          async handler() {
            update(null);
          },
        });
        return;
      }

      // 進行中の古い処理をキャンセルし、新しいコントローラーを生成します。
      this.navAbortController?.abort();
      const { signal } = this.navAbortController = new AbortController();
      const { formData } = event;
      const prevEntryInHandler = currentEntry;
      if (formData) {
        const { sourceElement } = event;
        if (sourceElement?.hasAttribute("data-sosekisubmit")) {
          document.body.removeChild(sourceElement);
        }

        let redirectUrl = new URL(currentEntry.url.href);
        let actionResultMap: ReadonlyMap<IAction, unknown> | undefined;
        event.intercept({
          precommitHandler: async controller => {
            const entry = {
              id: currentEntry.id,
              url: destUrl,
            };
            const waitForComplete = startActions({
              entry,
              routes: destRoutes,
              signal,
              formData,
              dataStore: actionDataStore,
            });
            if (!waitForComplete) {
              return;
            }

            update();
            const {
              redirect = currentEntry.url.pathname,
              resultMap,
            } = await waitForComplete();
            actionResultMap = resultMap;
            redirectUrl.pathname = redirect;
            controller.redirect(redirect);
          },
          handler: async () => {
            if (!actionResultMap) {
              return;
            }

            const currentEntry = expectHistoryEntry(this.nav.currentEntry);
            if (!currentEntry) {
              update(null);
              return;
            }
            if (currentEntry.url.href !== redirectUrl.href) {
              return;
            }

            const currentRoutes = matchRoutes(routes, currentEntry.url.pathname);
            if (!currentRoutes) {
              update(null);
              return;
            }

            const prevEntry = prevEntryInHandler;
            const prevRoutes = matchRoutes(routes, prevEntry.url.pathname);
            const waitForComplete = startLoaders({
              signal,
              formData,
              prevEntry,
              prevRoutes,
              currentEntry,
              currentRoutes,
              actionResultMap,
              actionDataStore,
              loaderDataStore,
            });
            update({
              entry: currentEntry,
              routes: currentRoutes,
            });
            if (!waitForComplete) {
              return;
            }

            await waitForComplete();
          },
        });
      } else {
        event.intercept({
          handler: async () => {
            const currentEntry = expectHistoryEntry(this.nav.currentEntry);
            if (!currentEntry) {
              update(null);
              return;
            }
            if (currentEntry.url.href !== destUrl.href) {
              return;
            }

            const prevEntry = prevEntryInHandler;
            const prevRoutes = matchRoutes(routes, prevEntry.url.pathname);
            const currentRoutes = destRoutes;
            const waitForComplete = startLoaders({
              signal,
              prevEntry,
              prevRoutes,
              currentEntry,
              currentRoutes,
              actionDataStore,
              loaderDataStore,
            });
            update({
              entry: currentEntry,
              routes: currentRoutes,
            });
            await waitForComplete?.();
          },
        });
      }
    };

    const signal = getSignal();

    const handleAbort = () => {
      this.navAbortController?.abort();
      this.navAbortController = null;
    };
    signal.addEventListener("abort", handleAbort, { once: true });

    this.nav.addEventListener("navigate", handleNavigate, { signal });
    // this.nav.addEventListener("navigateerror", console.error, { signal });

    // 既存のエントリーに対して dispose リスナーを登録し、メモリーを解放します。
    for (const entry of this.nav.entries()) {
      const entryId = v.expect(HistoryEntryIdSchema(), entry.id);
      if (this.subscribedEntryIds.has(entryId)) {
        continue;
      }

      const handleDispose = () => {
        this.subscribedEntryIds.delete(entryId);
        actionDataStore.delete(entryId);
        loaderDataStore.delete(entryId);
      };
      entry.addEventListener("dispose", handleDispose, { signal });
      this.subscribedEntryIds.add(entryId);
    }

    /**
     * 現在のエントリーが変更された際のハンドラーです。
     */
    const handleCurrentEntryChange = () => {
      const currentEntry = expectHistoryEntry(this.nav.currentEntry);
      if (!currentEntry) {
        return;
      }
      if (this.subscribedEntryIds.has(currentEntry.id)) {
        return;
      }

      const handleDispose = () => {
        this.subscribedEntryIds.delete(currentEntry.id);
        actionDataStore.delete(currentEntry.id);
        loaderDataStore.delete(currentEntry.id);
      };
      this.nav.currentEntry!.addEventListener("dispose", handleDispose, { signal });
      this.subscribedEntryIds.add(currentEntry.id);
    };
    this.nav.addEventListener("currententrychange", handleCurrentEntryChange, { signal });
  }

  /**
   * フォームデータやクエリー パラメーターを送信します。
   *
   * @param args 送信内容と送信先を含む引数です。
   */
  public submit(args: SubmitArgs): void {
    if ("actionId" in args) {
      const {
        target,
        action,
        actionId: actionFunction,
      } = args;
      const form = createHtmlFormElementFormFormData(target);
      const actionId = actionFunction && actionIdRegistry.set(actionFunction);
      if (actionId !== undefined) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = ACTION_ID_FORM_DATA_NAME;
        input.value = actionId;
      }

      form.method = "POST";
      form.action = action;
      form.enctype = "multipart/form-data";
      form.dataset["sosekisubmit"] = "";
      document.body.appendChild(form);
      form.submit();
    } else {
      const {
        target,
        action,
        history,
      } = args;
      const u = new URL("x://y" + action);
      u.search = target.toString();
      this.navigate({
        to: u.href.slice("x://y".length),
        history,
      });
    }
  }

  /**
   * 指定されたパスへナビゲートします。
   *
   * @param args 遷移先と遷移オプションを含む引数です。
   */
  public navigate(args: NavigateArgs): void {
    if ("delta" in args) {
      const currentEntry = expectHistoryEntry(this.nav.currentEntry);
      if (!currentEntry) {
        return;
      }

      const { delta } = args;
      const index = currentEntry.index + delta;
      const entry = this.nav.entries().find(e => e.index === index);
      if (!entry) {
        return;
      }

      this.nav.traverseTo(entry.key);
    } else {
      const {
        to,
        history,
      } = args;
      if (typeof to === "string") {
        this.nav.navigate(to, { history });
      } else {
        const { href } = location;
        const u = new URL(href);
        if (to.pathname !== undefined) {
          u.pathname = to.pathname;
        }
        if (to.search !== undefined) {
          u.search = to.search;
        }
        if (to.hash !== undefined) {
          u.hash = to.hash;
        }
        if (u.href !== href) {
          this.nav.navigate(u.href, { history });
        }
      }
    }
  }
}
