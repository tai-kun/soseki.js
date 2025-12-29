import * as React from "react";
import { Outlet, type ShouldReloadArgs, useActionData, useLoaderData, useSubmit } from "soseki";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export const path = "/";

export function shouldAction() {
  console.log("shouldAction: /", ...arguments);
  return true;
}

export async function action() {
  console.log("action: /", ...arguments);
  await sleep(1e3);
  return "home-action-data" as const;
}

export function shouldReload(args: ShouldReloadArgs) {
  console.log("shouldReload: /", ...arguments);
  return args.defaultShouldReload;
}

export async function loader() {
  console.log("loader: /", ...arguments);
  await sleep(1e3);
  return "home-loader-data" as const;
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
  const submit = useSubmit();

  return (
    <div>
      <React.Suspense fallback="actionData: 待機中">
        <ActionData />
      </React.Suspense>
      <React.Suspense fallback="loaderData: 待機中">
        <LoaderData />
      </React.Suspense>
      <div>
        <button
          type="button"
          onClick={() => {
            submit(new FormData());
          }}
          data-testid="about-submit"
        >
          送信
        </button>
      </div>
      <a
        href="./about"
        data-testid="home-toabout"
      >
        About
      </a>
      <Outlet />
    </div>
  );
}
