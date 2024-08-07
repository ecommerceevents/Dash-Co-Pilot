import { useLocation, useMatches } from "@remix-run/react";
import { Fragment, ReactNode, useEffect } from "react";
import { useRootData } from "~/utils/data/useRootData";
import AnalyticsHelper from "~/utils/helpers/AnalyticsHelper";

interface Props {
  flag: string;
  children: ReactNode;
}
export default function FeatureFlagTracker({ flag, children }: Props) {
  let location = useLocation();
  const rootData = useRootData();
  const matches = useMatches();

  useEffect(() => {
    async function track() {
      const routeMatch = matches.find((m) => m.pathname == location.pathname);
      AnalyticsHelper.addEvent({
        url: location.pathname,
        route: routeMatch?.id,
        rootData,
        action: flag,
        category: "featureFlag",
        label: "",
        value: "",
      });
    }

    if (rootData?.featureFlags.includes(flag)) {
      track();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flag]);

  return <Fragment>{children}</Fragment>;
}
