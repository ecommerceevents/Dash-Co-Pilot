import { useTranslation } from "react-i18next";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { EntityWebhookWithDetails, getEntityWebhooks } from "~/utils/db/entities/entityWebhooks.db.server";

type LoaderData = {
  items: EntityWebhookWithDetails[];
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const entity = await getEntityBySlug({ tenantId: null, slug: params.entity ?? "" });
  if (!entity) {
    return redirect("/admin/entities");
  }
  const items = await getEntityWebhooks(entity.id);
  const data: LoaderData = {
    items,
  };
  return json(data);
};

export default function EditEntityIndexRoute() {
  const data = useLoaderData<LoaderData>();
  const { t } = useTranslation();

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-sm font-medium leading-3 text-gray-800">Webhooks</h3>
        <TableSimple
          headers={[
            {
              title: "Action",
              name: "action",
              value: (item) => item.action,
            },
            {
              title: "Method",
              name: "method",
              value: (item) => item.method,
            },
            {
              title: "Endpoint",
              name: "endpoint",
              className: "w-full",
              value: (item) => item.endpoint,
            },
            {
              title: "Logs",
              name: "logs",
              className: "w-full",
              value: (item) => item._count.logs,
            },
          ]}
          items={data.items}
          actions={[
            {
              title: t("shared.edit"),
              onClickRoute: (idx, item) => item.id,
            },
          ]}
        ></TableSimple>
        <div className="w-fu flex justify-start">
          <ButtonTertiary to="new">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-medium uppercase">{t("shared.add")}</span>
          </ButtonTertiary>
        </div>
      </div>
      <Outlet />
    </>
  );
}
