import { useTranslation } from "react-i18next";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import TableSimple from "~/components/ui/tables/TableSimple";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { EntityTemplate } from "@prisma/client";
import { getEntityTemplates } from "~/utils/db/entities/entityTemplates.db.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { useTypedLoaderData } from "remix-typedjson";
import ShowPayloadModalButton from "~/components/ui/json/ShowPayloadModalButton";
import { PropertyType } from "~/application/enums/entities/PropertyType";

type LoaderData = {
  entity: EntityWithDetails;
  items: EntityTemplate[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdOrNull({ request, params });
  const entity = await getEntityBySlug({ tenantId, slug: params.entity ?? "" });
  const items = await getEntityTemplates(entity.id, { tenantId });
  const data: LoaderData = {
    entity,
    items,
  };
  return json(data);
};

export default function EntityTemplatesIndex() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();

  function getConfig(item: EntityTemplate) {
    try {
      const config = JSON.parse(item.config);
      const values: string[] = [];
      data.entity.properties
        .filter((f) => !f.isDefault)
        .sort((a, b) => a.order - b.order)
        .forEach((property) => {
          let value = config[property.name];
          if (value) {
            if (property.type === PropertyType.SELECT) {
              const option = property.options.find((f) => f.value === value);
              if (option) {
                value = option.name || option.value;
              }
            }
            values.push(t(property.title) + ": " + value);
          }
        });
      return values.join(", ");
    } catch (e) {
      return "";
    }
  }
  return (
    <>
      <div className="space-y-3">
        <h3 className="text-sm font-medium leading-3 text-gray-800">Templates</h3>
        <TableSimple
          headers={[
            {
              name: "title",
              title: "Title",
              value: (item) => item.title,
            },
            {
              title: "Template",
              name: "template",
              className: "max-w-xs",
              value: (item) => <ShowPayloadModalButton title={`Template: ${item.title}`} payload={getConfig(item)} />,
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
