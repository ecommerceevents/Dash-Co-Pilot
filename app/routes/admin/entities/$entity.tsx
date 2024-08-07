import { Entity } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useParams } from "@remix-run/react";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import TabsVertical from "~/components/ui/tabs/TabsVertical";
import { findEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type LoaderData = {
  item: Entity;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.entities.update");
  const item = await findEntityBySlug(params.entity!);
  if (!item) {
    return redirect("/admin/entities");
  }

  if (new URL(request.url).pathname === "/admin/entities/" + params.entity) {
    return redirect("/admin/entities/" + params.entity + "/details");
  }
  const data: LoaderData = {
    item,
  };
  return json(data);
};

export default function EditEntityRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const params = useParams();
  return (
    <EditPageLayout
      title={`${t(data.item.title)}`}
      menu={[
        { title: t("models.entity.plural"), routePath: "/admin/entities" },
        { title: t(data.item.title), routePath: `/admin/entities/${params.entity}/details` },
      ]}
      withHome={false}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 xl:gap-12">
        <div className="lg:col-span-3">
          <TabsVertical
            tabs={[
              {
                name: "Details",
                routePath: `/admin/entities/${params.entity}/details`,
              },
              {
                name: "Properties",
                routePath: `/admin/entities/${params.entity}/properties`,
              },
              {
                name: "Relationships",
                routePath: `/admin/entities/${params.entity}/relationships`,
              },
              {
                name: "Views",
                routePath: `/admin/entities/${params.entity}/views`,
              },
              {
                name: "Rows",
                routePath: `/admin/entities/${params.entity}/rows`,
              },
              // {
              //   name: "Views and Forms",
              //   routePath: `/admin/entities/${params.entity}/views-and-forms`,
              // },
              {
                name: "Logs",
                routePath: `/admin/entities/logs?entity=${data.item.id}`,
              },
              {
                name: "Webhooks",
                routePath: `/admin/entities/${params.entity}/webhooks`,
              },
              {
                name: "Templates",
                routePath: `/admin/entities/${params.entity}/templates`,
              },
              {
                name: "API",
                routePath: `/admin/entities/${params.entity}/api`,
              },
              {
                name: "No-code",
                routePath: `/admin/entities/${params.entity}/no-code`,
              },
              {
                name: "Danger",
                routePath: `/admin/entities/${params.entity}/danger`,
              },
            ]}
          />
        </div>
        <div className="lg:col-span-9">
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </EditPageLayout>
  );
}
