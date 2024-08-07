import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useTypedLoaderData } from "remix-typedjson";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { useTranslation } from "react-i18next";
import { getAllTenantPortals, PortalWithCount } from "~/modules/portals/db/portals.db.server";
import { Link, useParams } from "@remix-run/react";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import UrlUtils from "~/utils/app/UrlUtils";
import { useRootData } from "~/utils/data/useRootData";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import ServerError from "~/components/ui/errors/ServerError";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import ExternalLinkEmptyIcon from "~/components/ui/icons/ExternalLinkEmptyIcon";
import PortalServer from "~/modules/portals/services/Portal.server";
import { Fragment } from "react";
import TagsIconFilled from "~/components/ui/icons/crud/TagsIconFilled";
import EyeIcon from "~/components/ui/icons/EyeIcon";
import { db } from "~/utils/db.server";

type PortalWithCounts = PortalWithCount & {
  portalUrl?: string;
  _count: {
    users: number;
    subscriptionProducts: number;
    visitors?: number;
  };
};
type LoaderData = {
  items: PortalWithCounts[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const appConfiguration = await getAppConfiguration({ request });
  const config = appConfiguration.portals;
  if (!config?.enabled) {
    throw json({ error: "Portals are not enabled" }, { status: 400 });
  }
  if (!config?.forTenants) {
    throw json({ error: "You don't have access to this feature" }, { status: 403 });
  }
  if (!process.env.PORTAL_SERVER_URL) {
    throw new Error("PORTAL_SERVER_URL is not defined");
  }
  const tenantId = await getTenantIdFromUrl(params);
  const items: PortalWithCounts[] = await getAllTenantPortals({ tenantId });
  for (const item of items) {
    item.portalUrl = PortalServer.getPortalUrl(item);
    item._count = {
      ...item._count,
      visitors: await db.analyticsUniqueVisitor.count({ where: { portalId: item.id } }),
    };
  }
  const data: LoaderData = {
    items,
  };
  return json(data);
};

export default function () {
  const { t } = useTranslation();
  const rootData = useRootData();
  const data = useTypedLoaderData<LoaderData>();
  const params = useParams();
  const portalsConfig = rootData.appConfiguration.portals;

  return (
    <EditPageLayout
      title={t("models.portal.plural")}
      buttons={
        <>
          <ButtonPrimary to={UrlUtils.getModulePath(params, `portals/new`)}>{t("shared.new")}</ButtonPrimary>
        </>
      }
    >
      {!rootData.appConfiguration.portals?.enabled && (
        <WarningBanner title={t("shared.warning")}>
          Portals are not enabled. Enabled it at <code className="font-bold">app/utils/db/appConfiguration.db.server.ts</code>.
        </WarningBanner>
      )}
      <div className="space-y-2">
        {data.items.length === 0 && (
          <EmptyState
            className="bg-background"
            to="new"
            captions={{
              // description: t("shared.noRecords"),
              new: t("models.portal.actions.new.title"),
            }}
          />
        )}
        <div className="grid grid-cols-3 gap-4">
          {data.items.map((item) => {
            return (
              <div key={item.id} className="border-border hover:border-primary group relative flex flex-col rounded-lg border bg-white hover:shadow-sm">
                <Link to={item.subdomain}>
                  {item.portalUrl && (
                    <Fragment>
                      {item.isPublished ? (
                        <Link
                          to={item.portalUrl}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-secondary/80 text-muted-foreground hover:text-secondary-foreground hover:bg-secondary absolute right-3 top-4 hidden rounded-md p-1.5 group-hover:flex"
                        >
                          <ExternalLinkEmptyIcon className="h-4 w-4" />
                        </Link>
                      ) : (
                        <span className="text-muted-foreground/80 absolute right-3 top-4 hidden text-xs italic group-hover:flex">Unpublished</span>
                      )}
                    </Fragment>
                  )}
                  <div className="p-4">
                    <div className="flex items-center space-x-2">
                      {item.brandingIcon && (
                        <img
                          src={item.brandingIcon}
                          alt={item.title}
                          className="inline-block h-9 w-9 shrink-0 rounded-full bg-gray-100 object-contain p-0.5 shadow-sm"
                        />
                      )}
                      <div className="space-y-1">
                        <div>
                          <div className="line-clamp-1 text-base font-medium">{item.title}</div>
                          <div className="text-muted-foreground text-xs">{item.portalUrl?.replace("https://", "").replace("http://", "")}</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <div className="text-muted-foreground inline-flex items-center gap-1 text-sm lowercase">
                        <UserIcon className="h-3 w-3 text-gray-300" /> {item._count.users}{" "}
                        {item._count.users === 1 ? t("models.user.object") : t("models.user.plural")}
                      </div>
                      {portalsConfig?.pricing && (
                        <div className="text-muted-foreground inline-flex items-center gap-1 text-sm lowercase">
                          <TagsIconFilled className="h-3 w-3 text-gray-300" /> {item._count.subscriptionProducts}{" "}
                          {item._count.subscriptionProducts === 1 ? "plan" : "plans"}
                        </div>
                      )}
                      {portalsConfig?.analytics && (
                        <div className="text-muted-foreground inline-flex items-center gap-1 text-sm lowercase">
                          <EyeIcon className="h-3 w-3 text-gray-300" /> {item._count.visitors}{" "}
                          {item._count.visitors === 1 ? t("analytics.visitor") : t("analytics.visitors")}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </EditPageLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}

function UserIcon({ className }: { className: string }) {
  return (
    // <svg className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 30 30">
    //   <path d="M 15 3 C 11.686 3 9 5.686 9 9 L 9 10 C 9 13.314 11.686 16 15 16 C 18.314 16 21 13.314 21 10 L 21 9 C 21 5.686 18.314 3 15 3 z M 14.998047 19 C 10.992047 19 5.8520469 21.166844 4.3730469 23.089844 C 3.4590469 24.278844 4.329125 26 5.828125 26 L 24.169922 26 C 25.668922 26 26.539 24.278844 25.625 23.089844 C 24.146 21.167844 19.004047 19 14.998047 19 z"></path>
    // </svg>
    <svg className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 48 48">
      <path d="M24 4A10 10 0 1024 24 10 10 0 1024 4zM36.021 28H11.979C9.785 28 8 29.785 8 31.979V33.5c0 3.312 1.885 6.176 5.307 8.063C16.154 43.135 19.952 44 24 44c7.706 0 16-3.286 16-10.5v-1.521C40 29.785 38.215 28 36.021 28z"></path>
    </svg>
  );
}
