import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useRootData } from "~/utils/data/useRootData";
import { JSONTree } from "react-json-tree";
import HeaderBlock from "~/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import { Link, useSearchParams } from "@remix-run/react";
import { getUserInfo } from "~/utils/session.server";
import { getUser } from "~/utils/db/users.db.server";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "debug");
  const userInfo = await time(getUserInfo(request), "getUserInfo");
  const user = await getUser(userInfo.userId);
  if (process.env.NODE_ENV !== "development" && !user?.admin) {
    throw redirect("/404?error=development-only");
  }
  return json({}, { headers: getServerTimingHeader() });
};

// themes: https://github.com/reduxjs/redux-devtools/tree/75322b15ee7ba03fddf10ac3399881e302848874/src/react/themes
const jsonTreeTheme = {
  scheme: "harmonic16",
  author: "jannik siebert (https://github.com/janniks)",
  base00: "#0b1c2c",
  base01: "#223b54",
  base02: "#405c79",
  base03: "#627e99",
  base04: "#aabcce",
  base05: "#cbd6e2",
  base06: "#e5ebf1",
  base07: "#f7f9fb",
  base08: "#bf8b56",
  base09: "#bfbf56",
  base0A: "#8bbf56",
  base0B: "#56bf8b",
  base0C: "#568bbf",
  base0D: "#8b56bf",
  base0E: "#bf568b",
  base0F: "#bf5656",
};

export default function DebugRoute() {
  const rootData = useRootData();
  const [searchParams, setSearchParams] = useSearchParams();
  function toggleCookies() {
    if (searchParams.get("cookies")) {
      searchParams.delete("cookies");
    } else {
      searchParams.set("cookies", "true");
    }
    setSearchParams(searchParams);
  }
  return (
    <div>
      <HeaderBlock />
      <div className="prose p-12">
        <Link to=".">
          <h3 className="text-black dark:text-white">Debug</h3>
        </Link>

        <div>
          <div className="flex justify-between space-x-2">
            <p className="font-medium text-black dark:text-white">Root Data</p>
            <button type="button" className="text-theme-500 underline" onClick={() => toggleCookies()}>
              {searchParams.get("cookies") ? "Hide cookie settings" : "Show cookie settings"}
            </button>
          </div>
          <p className="break-words rounded-md border border-gray-300 bg-gray-50 p-4 text-black dark:bg-gray-800 dark:text-white">
            <div className="hidden dark:block">
              <JSONTree invertTheme={false} data={rootData} theme={jsonTreeTheme} />
            </div>
            <div className="dark:hidden">
              <JSONTree invertTheme={true} data={rootData} theme={jsonTreeTheme} />
            </div>
          </p>
        </div>
      </div>
    </div>
  );
}
