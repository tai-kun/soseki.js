import * as React from "react";
import { Outlet, type ShouldReloadArgs, useActionData, useLoaderData } from "soseki";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export const path = "about";

export function shouldAction() {
  console.log("shouldAction: /about", ...arguments);
  return true;
}

export async function action() {
  console.log("action: /about", ...arguments);
  await sleep(1e3);
  return "about-action-data" as const;
}

export function shouldReload(args: ShouldReloadArgs) {
  console.log("shouldReload: /about", ...arguments);
  return args.defaultShouldReload;
}

export async function loader() {
  console.log("loader: /about", ...arguments);
  await sleep(3e3);
  return "about-loader-data" as const;
}

function ActionData() {
  const actionData = useActionData(action);
  if (!actionData) {
    return <div>actionData: N/A</div>;
  }

  const result = React.use(actionData);
  return <div>actionData: {result}</div>;
}

function LoaderData() {
  const loaderData = useLoaderData(loader);
  const result = React.use(loaderData);
  return <div>loaderData: {result}</div>;
}

export default function Home() {
  return (
    <div>
      <React.Suspense fallback="actionData: 待機中">
        <ActionData />
      </React.Suspense>
      <React.Suspense fallback="loaderData: 待機中">
        <LoaderData />
      </React.Suspense>
      <form
        method="POST"
        action="/about"
        data-testid="about-form"
      >
        <button
          type="submit"
          data-testid="about-submit"
        >
          送信
        </button>
      </form>
      <a
        href="/"
        data-testid="about-tohome"
      >
        Home
      </a>
      <Outlet />
    </div>
  );
}
