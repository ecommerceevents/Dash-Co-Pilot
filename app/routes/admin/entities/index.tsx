import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import EntitiesTable from "~/components/entities/EntitiesTable";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import InputSearch from "~/components/ui/input/InputSearch";
import { getTranslations } from "~/locale/i18next.server";
import { useAdminData } from "~/utils/data/useAdminData";
import { EntityWithCount, getAllEntitiesWithRowCount, updateEntity } from "~/utils/db/entities/entities.db.server";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import DateUtils from "~/utils/shared/DateUtils";
import { EntityRelationshipWithDetails, getAllEntityRelationships } from "~/utils/db/entities/entityRelationships.db.server";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import DownloadIcon from "~/components/ui/icons/DownloadIcon";
import { useTypedLoaderData } from "remix-typedjson";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import EntityHelper from "~/utils/helpers/EntityHelper";

type LoaderData = {
  title: string;
  items: EntityWithCount[];
  relationships: EntityRelationshipWithDetails[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.entities.view");
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdOrNull({ request, params });
  const items = await getAllEntitiesWithRowCount({ tenantId });
  const relationships = await getAllEntityRelationships();

  const data: LoaderData = {
    title: `${t("models.entity.plural")} | ${process.env.APP_NAME}`,
    items,
    relationships,
  };
  return json(data);
};

export const action: ActionFunction = async ({ request }) => {
  const { t } = await getTranslations(request);

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";

  if (action === "set-orders") {
    const items: { id: string; order: number }[] = form.getAll("orders[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    await Promise.all(
      items.map(async ({ id, order }) => {
        await updateEntity(id, { order: Number(order) });
      })
    );
    return json({ updated: true });
  }
  return json({ error: t("shared.invalidForm") }, { status: 400 });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const adminData = useAdminData();

  const [selected, setSelected] = useState<EntityWithCount[]>([]);
  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!data.items) {
      return [];
    }
    return data.items.filter(
      (f) =>
        DateUtils.dateYMDHMS(f.createdAt)?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.slug?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.title?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.titlePlural?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        t(f.title)?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        t(f.titlePlural)?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.properties.find(
          (x) =>
            x.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
            x.title?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
            t(x.title)?.toString().toUpperCase().includes(searchInput.toUpperCase())
        )
    );
  };

  function exportEntities() {
    let items = selected.length > 0 ? selected : filteredItems();
    const templateEntities = EntityHelper.exportEntitiesToTemplate(items, data.relationships);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templateEntities, null, "\t"));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "entities.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
      <div className="md:border-b md:border-gray-200 md:py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-lg font-medium leading-6">{t("models.entity.plural")}</h3>
          <div className="flex items-center space-x-2">
            <InputSearch className="hidden sm:block" value={searchInput} setValue={setSearchInput} />
            <ButtonSecondary disabled={data.items.length === 0} onClick={exportEntities} className="text-gray-500">
              <DownloadIcon className="h-5 w-5" />
            </ButtonSecondary>
            <ButtonPrimary disabled={!getUserHasPermission(adminData, "admin.entities.create")} to="/admin/entities/new">
              <span>{t("shared.new")}</span>
            </ButtonPrimary>
          </div>
        </div>
      </div>

      <EntitiesTable items={filteredItems()} selected={selected} onSelected={(e) => setSelected(e)} />

      {/* <div className="mt-2">
        <h3 className="text-lg font-medium leading-6 text-foreground">{t("models.relationship.plural")}</h3>
        <EntityRelationshipsTable items={data.relationships} editable={false} />
      </div> */}
    </div>
  );
}
