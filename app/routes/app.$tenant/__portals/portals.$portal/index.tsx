import { ActionFunction, json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { Link, useLoaderData, useParams, useSubmit } from "@remix-run/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useTypedActionData } from "remix-typedjson";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ExternalLinkEmptyIcon from "~/components/ui/icons/ExternalLinkEmptyIcon";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { getTranslations } from "~/locale/i18next.server";
import { getPortalById, PortalWithDetails, updatePortal } from "~/modules/portals/db/portals.db.server";
import PortalServer from "~/modules/portals/services/Portal.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { db } from "~/utils/db.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import NumberUtils from "~/utils/shared/NumberUtils";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import GearIcon from "~/components/ui/icons/GearIcon";
import { useRootData } from "~/utils/data/useRootData";

export const meta: MetaFunction<typeof loader> = ({ data }) => (data && "metatags" in data ? data.metatags : []);

type LoaderData = {
  metatags: MetaTagsDto;
  item: PortalWithDetails & { portalUrl?: string };
  overview: {
    users: number;
    visitors: number;
    products: number;
  };
};
export const loader: LoaderFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdOrNull({ request, params });
  const item: (PortalWithDetails & { portalUrl?: string }) | null = await getPortalById(tenantId, params.portal!);
  if (!item) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }
  item.portalUrl = PortalServer.getPortalUrl(item);
  const data: LoaderData = {
    metatags: [{ title: `${item.title} | ${t("models.portal.object")}` }],
    item,
    overview: {
      users: await db.portalUser.count({ where: { portalId: item.id } }),
      visitors: await db.analyticsUniqueVisitor.count({ where: { portalId: item.id } }),
      products: await db.portalSubscriptionProduct.count({ where: { portalId: item.id } }),
    },
  };
  return json(data);
};

type ActionData = { success?: string; error?: string };
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action");
  const tenantId = await getTenantIdOrNull({ request, params });
  const item = await getPortalById(tenantId, params.portal!);
  if (!item) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }
  if (action === "toggle-published") {
    await updatePortal(item, {
      isPublished: !item.isPublished,
    });
    return json({ success: t("shared.updated") });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const submit = useSubmit();
  const params = useParams();
  const rootData = useRootData();
  const portalsConfig = rootData.appConfiguration.portals;

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <>
      <EditPageLayout
        title={
          <div className="flex items-baseline space-x-2">
            <div>{data.item.title} </div>
            <SimpleBadge
              title={data.item.isPublished ? t("shared.published") : t("shared.unpublished")}
              color={data.item.isPublished ? Colors.GREEN : Colors.GRAY}
            />
          </div>
        }
        withHome={false}
        menu={[
          // {
          //   title: t("models.portal.plural"),
          //   routePath: UrlUtils.getModulePath(params, "portals"),
          // },
          {
            title: data.item.title,
            routePath: UrlUtils.getModulePath(params, `portals/${data.item.subdomain}`),
          },
          {
            title: t("shared.overview"),
          },
        ]}
        buttons={
          <>
            <div className="flex items-center space-x-2">
              <ButtonSecondary to="settings">
                <GearIcon className="h-4 w-4" />
              </ButtonSecondary>
              <ButtonSecondary
                onClick={() => {
                  const form = new FormData();
                  form.set("action", "toggle-published");
                  submit(form, {
                    method: "post",
                  });
                }}
              >
                {data.item.isPublished ? t("shared.unpublish") : t("shared.publish")}
              </ButtonSecondary>
            </div>
            {data.item.portalUrl && (
              <ButtonPrimary to={data.item.portalUrl} target="_blank" disabled={!data.item.isPublished}>
                <div className="flex items-center space-x-2">
                  <ExternalLinkEmptyIcon className="h-4 w-4" />
                  {/* <div>{t("shared.preview")}</div> */}
                </div>
              </ButtonPrimary>
            )}
          </>
        }
      >
        <dl className="grid gap-2 sm:grid-cols-3">
          <Link to="users" className="group">
            <div className="bg-background border-border group rounded-lg border p-4">
              <dt className="truncate text-xs font-medium uppercase text-gray-500 group-hover:underline">{t("models.user.plural")}</dt>
              <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">{NumberUtils.intFormat(data.overview.users)}</dd>
            </div>
          </Link>
          {portalsConfig?.analytics && (
            <Link to="analytics" className="group">
              <div className="bg-background border-border group rounded-lg border p-4">
                <dt className="truncate text-xs font-medium uppercase text-gray-500 group-hover:underline">Visitors</dt>
                <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">{NumberUtils.intFormat(data.overview.visitors)}</dd>
              </div>
            </Link>
          )}

          {portalsConfig?.pricing && (
            <Link to="pricing" className="group">
              <div className="bg-background border-border group rounded-lg border p-4">
                <dt className="truncate text-xs font-medium uppercase text-gray-500 group-hover:underline">Products</dt>
                <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">{NumberUtils.intFormat(data.overview.products)}</dd>
              </div>
            </Link>
          )}

          {/* {data.item.domain && portalsConfig?.domains?.enabled && (
            <Link to={data.item.domain} className="group" target="_blank">
              <Card className="">
                <dt className="truncate text-xs font-medium text-gray-500 group-hover:underline">{data.item.domain}</dt>
                <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">Domain</dd>
              </Card>
            </Link>
          )} */}
        </dl>
      </EditPageLayout>
    </>
  );
}
