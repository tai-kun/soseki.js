export type * from "./components/browser-router.jsx";
export { default as BrowserRouter } from "./components/browser-router.jsx";

export type * from "./components/outlet.jsx";
export { default as Outlet } from "./components/outlet.jsx";

/**************************************************************************************************/

export type {
  Issue,
  UnreachableErrorArgs,
  UnreachableErrorMeta,
  LoaderConditionErrorArgs,
  LoaderConditionErrorMeta,
  LoaderDataNotFoundErrorArgs,
  LoaderDataNotFoundErrorMeta,
  UnexpectedValidationErrorArgs,
  UnexpectedValidationErrorMeta,
} from "./core/errors.js";
export {
  ErrorBase,
  setErrorMessage,
  UnreachableError,
  ValidationErrorBase,
  LoaderConditionError,
  LoaderDataNotFoundError,
  RouteContextMissingError,
  RouterContextMissingError,
  UnexpectedValidationError,
  NavigationApiNotSupportedError,
} from "./core/errors.js";

export type * from "./core/readonly-form-data.types.js";

export type * from "./core/readonly-url.types.js";

export type * from "./core/redirect-response.js";
export { default as RedirectResponse } from "./core/redirect-response.js";

export type * from "./core/route-request.js";
export { default as RouteRequest } from "./core/route-request.js";

export type * from "./core/route.types.js";

/**************************************************************************************************/

export type * from "./hooks/use-action-data.js";
export { default as useActionData } from "./hooks/use-action-data.js";

export type * from "./hooks/use-form-action.js";
export { default as useFormAction } from "./hooks/use-form-action.js";

export type * from "./hooks/use-loader-data.js";
export { default as useLoaderData } from "./hooks/use-loader-data.js";

export type * from "./hooks/use-navigate.js";
export { default as useNavigate } from "./hooks/use-navigate.js";

export type * from "./hooks/use-params.js";
export { default as useParams } from "./hooks/use-params.js";

export type * from "./hooks/use-route-path.js";
export { default as useRoutePath } from "./hooks/use-route-path.js";

export type * from "./hooks/use-submit.js";
export { default as useSubmit } from "./hooks/use-submit.js";

/**************************************************************************************************/

export type * from "./utils/redirect.js";
export { default as redirect } from "./utils/redirect.js";
