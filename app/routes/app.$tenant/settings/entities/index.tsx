import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { DefaultEntityTypes } from "~/application/dtos/shared/DefaultEntityTypes";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import { EntityWithDetails, getAllEntities } from "~/utils/db/entities/entities.db.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";

type LoaderData = {
  allEntities: EntityWithDetails[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const appConfiguration = await getAppConfiguration({ request });
  if (!appConfiguration.app.features.tenantEntityCustomization) {
    throw Error("Entity customization is not enabled");
  }
  const tenantId = await getTenantIdOrNull({ request, params });
  const allEntities = await getAllEntities({ tenantId, active: true, types: [DefaultEntityTypes.All, DefaultEntityTypes.AppOnly] });
  const data: LoaderData = {
    allEntities,
  };
  return json(data);
};
export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  return (
    <EditPageLayout title={t("models.entity.plural")}>
      <div className="space-y-2">
        <TableSimple
          items={data.allEntities}
          actions={[
            {
              title: t("models.entity.templates"),
              onClickRoute: (_, item) => item.slug + "/templates",
            },
            {
              title: t("models.property.plural"),
              onClickRoute: (_, item) => item.slug,
            },
          ]}
          headers={[
            {
              name: "title",
              title: t("models.entity.title"),
              value: (item) => (
                <div>
                  <div className="flex items-center space-x-1">
                    <Link to={item.slug} className="font-medium hover:underline">
                      {t(item.titlePlural)}
                    </Link>
                  </div>
                </div>
              ),
            },
            {
              name: "properties",
              title: t("models.property.plural"),
              className: "w-full text-xs",
              value: (item) => (
                <div className="max-w-xs truncate">
                  {item.properties.filter((f) => !f.isDefault).length > 0 ? (
                    <Link className="truncate pb-1 hover:underline" to={item.slug}>
                      {item.properties
                        .filter((f) => !f.isDefault)
                        .map((f) => t(f.title) + (f.isRequired ? "*" : ""))
                        .join(", ")}
                    </Link>
                  ) : (
                    <Link className="truncate pb-1 text-gray-400 hover:underline" to={item.slug}>
                      {t("shared.setCustomProperties")}
                    </Link>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </EditPageLayout>
  );
}
