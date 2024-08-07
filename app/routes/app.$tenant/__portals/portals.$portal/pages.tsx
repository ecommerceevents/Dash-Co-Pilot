import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useNavigate, useOutlet, useParams } from "@remix-run/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { toast } from "react-hot-toast";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { getTranslations } from "~/locale/i18next.server";
import { PortalWithDetails, getPortalById, updatePortal } from "~/modules/portals/db/portals.db.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { getPortalPages } from "~/modules/portals/db/portalPages.db.server";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import PortalServer from "~/modules/portals/services/Portal.server";
import { JsonPropertiesValuesDto } from "~/modules/jsonProperties/dtos/JsonPropertiesValuesDto";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import ExternalLinkEmptyIcon from "~/components/ui/icons/ExternalLinkEmptyIcon";
import clsx from "clsx";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";

type LoaderData = {
  portal: PortalWithDetails;
  pages: {
    name: string;
    title: string;
    attributes: JsonPropertiesValuesDto | null;
    errors: string[];
    slug: string;
    href: string;
  }[];
  portalUrl: string;
};
export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  const appConfiguration = await getAppConfiguration({ request });
  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await getPortalById(tenantId, params.portal!);
  if (!portal) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }
  const allPages = await getPortalPages(portal.id);
  const portalUrl = PortalServer.getPortalUrl(portal);
  const pages = appConfiguration.portals.pages.map((page) => {
    const existing = allPages.find((p) => p.name === page.name);
    const attributes = existing ? (existing.attributes as JsonPropertiesValuesDto) : null;
    return {
      name: page.name,
      title: page.title,
      attributes,
      errors: page.errors ? page.errors({ portal, page: attributes ? { attributes } : null }) : [],
      slug: page.slug,
      href: `${portalUrl}${page.slug}`,
    };
  });
  const data: LoaderData = {
    portal,
    pages,
    portalUrl,
  };
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
};
export let action = async ({ request, params }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);

  const tenantId = await getTenantIdOrNull({ request, params });
  const item = await getPortalById(tenantId, params.portal!);
  if (!item) {
    return json({ error: t("shared.notFound") }, { status: 404 });
  }

  const form = await request.formData();
  const action = form.get("action");
  if (action === "edit") {
    const seoTitle = form.get("seoTitle")?.toString();
    const seoDescription = form.get("seoDescription")?.toString();
    const seoImage = form.get("seoImage")?.toString();
    const stripeAccountId = form.get("stripeAccountId")?.toString();

    await updatePortal(item, {
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      seoImage: seoImage || null,
      stripeAccountId: stripeAccountId || null,
    });

    return json({ success: t("shared.saved") });
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const params = useParams();
  const outlet = useOutlet();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  const selectedPage = data.pages.find((p) => p.name === params.name);
  return (
    <EditPageLayout
      title={t("models.portal.pages.plural")}
      withHome={false}
      menu={[
        {
          title: data.portal.title,
          routePath: UrlUtils.getModulePath(params, `portals/${data.portal.subdomain}`),
        },
        {
          title: t("models.portal.pages.plural"),
        },
      ]}
    >
      {/* <TableSimple
        items={pages}
        actions={[
          {
            renderTitle: (i) => t("shared.edit"),
            onClickRoute: (_, i) => UrlUtils.getModulePath(params, `portals/${data.portal.subdomain}/pages/${i.name}`),
          },
        ]}
        headers={[
          {
            name: "status",
            title: "Status",
            value: (item) => {
              let isPublished = item.id ? true : false;
              if (item.name === "pricing") {
                isPublished = data.portal.stripeAccountId ? true : false;
              }
              return <SimpleBadge title={isPublished ? t("shared.published") : t("shared.unpublished")} color={isPublished ? Colors.GREEN : Colors.GRAY} />;
            },
          },
          {
            name: "page",
            title: "Page",
            value: (item) => (
              <div className="flex flex-col">
                <Link to={`${data.portalUrl}/${item.name}`} target="_blank" className="font-medium hover:underline">
                  /{item.name}
                </Link>
              </div>
            ),
          },
          {
            name: "title",
            title: "Title",
            className: "w-full",
            value: (item) => (
              <div className="flex flex-col">
                <div className="text-sm">{item.title}</div>
                <div className="text-muted-foreground text-xs">{item.title}</div>
              </div>
            ),
          },
        ]}
      /> */}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data.pages.map((page) => {
          return (
            <div
              key={page.name}
              className={clsx(
                "border-border hover:border-primary group relative flex flex-col rounded-lg border hover:shadow-sm",
                page.errors.length === 0 ? "bg-white" : "bg-red-50"
              )}
            >
              <Link to={page.name}>
                {page.href && (
                  <div>
                    <Link
                      to={page.href}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-secondary/80 text-muted-foreground hover:text-secondary-foreground hover:bg-secondary absolute right-3 top-4 hidden rounded-md p-1.5 group-hover:flex"
                    >
                      <ExternalLinkEmptyIcon className="h-4 w-4" />
                    </Link>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex flex-col">
                    <div className="font-medium">{page.title}</div>
                    {/* <div className="text-muted-foreground text-sm">{page.slug}</div> */}
                    {page.errors.length > 0 && <div className="line-clamp-2 text-sm text-red-500">{page.errors.join(", ")}</div>}
                    {/* <div className="text-muted-foreground text-sm">{JSON.stringify(page.attributes)}</div> */}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <SlideOverWideEmpty
        title={selectedPage?.title ?? t("models.portal.pages.object")}
        open={!!outlet}
        onClose={() => {
          navigate(".", { replace: true });
        }}
        withClose={false}
        className="sm:max-w-xl"
        overflowYScroll={true}
        buttons={
          <>
            {selectedPage && (
              <div>
                <ButtonSecondary to={data.portalUrl + selectedPage.slug} target="_blank">
                  <ExternalLinkIcon className="h-4 w-4" />
                </ButtonSecondary>
              </div>
            )}
          </>
        }
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{outlet}</div>
        </div>
      </SlideOverWideEmpty>
    </EditPageLayout>
  );
}
