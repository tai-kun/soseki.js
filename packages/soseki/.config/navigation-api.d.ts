interface PrecommitHandlerController {
  redirect(
    url: string,
    options?: {
      state?: unknown;
      history?: NavigationHistoryBehavior;
    },
  ): void;
}

type NavigationInterceptPrecommitHandler = (
  controller: PrecommitHandlerController,
) => Promise<void>;

interface NavigationInterceptOptions {
  /** @see https://developer.mozilla.org/docs/Web/API/NavigationPrecommitController */
  precommitHandler?: NavigationInterceptPrecommitHandler;
}
