import { LoaderFunctionArgs, MetaFunction, json, redirect } from "@remix-run/node";
import { useParams, Outlet } from "@remix-run/react";
import { useState, useEffect, Fragment, useRef } from "react";
import { useTranslation } from "react-i18next";
import SidebarIconsLayout, { IconDto } from "~/components/ui/layouts/SidebarIconsLayout";
import { getTranslations } from "~/locale/i18next.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { getEntityGroupBySlug } from "~/utils/db/entities/entityGroups.db.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";

type LoaderData = {
  title: string;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdOrNull({ request, params });
  const group = await getEntityGroupBySlug(params.group!);
  if (!group) {
    throw redirect(tenantId ? UrlUtils.currentTenantUrl(params, "404") : "/404");
  }
  const data: LoaderData = {
    title: `${t(group.title)} | ${process.env.APP_NAME}`,
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default () => {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const params = useParams();
  const [items, setItems] = useState<IconDto[]>([]);

  const mainElement = useRef<HTMLDivElement>(null);
  // useElementScrollRestoration({ apply: false }, mainElement);

  useEffect(() => {
    const group = appOrAdminData.entityGroups.find((f) => f.slug === params.group);
    if (!group) {
      return;
    }
    const thereAreIcons = group.entities.some(({ entity }) => !!entity.icon);
    const items: IconDto[] = [
      {
        name: t("shared.summary"),
        href: params.tenant ? `/app/${params.tenant}/g/${params.group}` : `/admin/g/${params.group}`,
        prefetch: "intent",
        exact: true,
        icon: !thereAreIcons ? undefined : (
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 50 50" fill="currentColor">
            <path d="M 39 0 L 39 2 L 46.5625 2 L 34 14.5625 L 30.71875 11.28125 L 30 10.59375 L 29.28125 11.28125 L 18 22.5625 L 14.71875 19.28125 L 14 18.59375 L 13.28125 19.28125 L 0.28125 32.28125 L 1.71875 33.71875 L 14 21.4375 L 17.28125 24.71875 L 18 25.40625 L 18.71875 24.71875 L 30 13.4375 L 33.28125 16.71875 L 34 17.40625 L 34.71875 16.71875 L 48 3.4375 L 48 11 L 50 11 L 50 0 Z M 42 14 L 42 50 L 44 50 L 44 14 Z M 48 15 L 48 50 L 50 50 L 50 15 Z M 30 20 L 30 50 L 32 50 L 32 20 Z M 36 20 L 36 50 L 38 50 L 38 20 Z M 24 24 L 24 50 L 26 50 L 26 24 Z M 12 28 L 12 50 L 14 50 L 14 28 Z M 18 30 L 18 50 L 20 50 L 20 30 Z M 6 34 L 6 50 L 8 50 L 8 34 Z M 0 38 L 0 50 L 2 50 L 2 38 Z"></path>
          </svg>
        ),
        iconSelected: !thereAreIcons ? undefined : (
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 50 50" fill="currentColor">
            <path d="M 38 0 L 38 4 L 43.1875 4 L 34 13.1875 L 31.40625 10.59375 L 30 9.15625 L 28.59375 10.59375 L 18 21.1875 L 15.40625 18.59375 L 14 17.15625 L 12.59375 18.59375 L 0.59375 30.59375 L 3.40625 33.40625 L 14 22.8125 L 16.59375 25.40625 L 18 26.84375 L 19.40625 25.40625 L 30 14.8125 L 32.59375 17.40625 L 34 18.84375 L 35.40625 17.40625 L 46 6.8125 L 46 12 L 50 12 L 50 0 Z M 44 15 L 44 50 L 48 50 L 48 15 Z M 30 20 L 30 50 L 34 50 L 34 20 Z M 37 20 L 37 50 L 41 50 L 41 20 Z M 23 24 L 23 50 L 27 50 L 27 24 Z M 16 30 L 16 50 L 20 50 L 20 30 Z M 9 31 L 9 50 L 13 50 L 13 31 Z M 2 38 L 2 50 L 6 50 L 6 38 Z"></path>
          </svg>
        ),
      },
    ];
    group.entities.forEach(({ entity }) => {
      items.push({
        name: t(entity.titlePlural),
        href: params.tenant ? `/app/${params.tenant}/g/${params.group}/${entity.slug}` : `/admin/g/${params.group}/${entity.slug}`,
        prefetch: "intent",
        // icon: entity.icon,
        // iconSelected: entity.icon,
        textIcon: entity.icon,
        textIconSelected: entity.icon,
      });
    });
    setItems(items);
  }, [appOrAdminData, params.group, params.tenant, t]);

  return (
    <Fragment>
      {!params.id ? (
        <SidebarIconsLayout label={{ align: "right" }} items={items}>
          <Outlet />
        </SidebarIconsLayout>
      ) : (
        <div className="sm:h-[calc(100vh-56px)]">
          <div ref={mainElement} className="w-full overflow-x-hidden">
            <Outlet />
          </div>
        </div>
      )}
    </Fragment>
  );
};
