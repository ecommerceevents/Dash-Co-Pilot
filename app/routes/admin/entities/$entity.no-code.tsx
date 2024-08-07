import { Entity } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useParams } from "@remix-run/react";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import ServerError from "~/components/ui/errors/ServerError";

type LoaderData = {
  item: Entity;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.entities.update");
  const item = await getEntityBySlug({ tenantId: null, slug: params.entity! });
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

export default function EntityCrudPreviewRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const params = useParams();
  return (
    <EditPageLayout
      title={`${t(data.item.title)} - Sample views`}
      menu={[
        { title: t("models.entity.plural"), routePath: "/admin/entities" },
        { title: t(data.item.title), routePath: `/admin/entities/${params.entity}/details` },
        { title: "No-code", routePath: `/admin/entities/${params.entity}/no-code` },
      ]}
      withHome={false}
    >
      <div className="h-[calc(100vh-200px)] overflow-y-auto rounded-lg border-2 border-dashed border-gray-800 bg-gray-50 sm:h-[calc(100vh-160px)]">
        <Outlet />
      </div>
    </EditPageLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
