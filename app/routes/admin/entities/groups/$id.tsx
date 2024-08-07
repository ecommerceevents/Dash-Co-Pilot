import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useTypedLoaderData } from "remix-typedjson";
import { EntityGroupForm } from "~/components/entities/EntityGroupForm";
import { getTranslations } from "~/locale/i18next.server";
import { EntityWithDetails, getAllEntities } from "~/utils/db/entities/entities.db.server";
import { EntityGroupWithDetails, deleteEntityGroup, getAllEntityGroups, getEntityGroup, updateEntityGroup } from "~/utils/db/entities/entityGroups.db.server";
import { EntityViewWithTenantAndUser, getAllEntityViews } from "~/utils/db/entities/entityViews.db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

type LoaderData = {
  item: EntityGroupWithDetails;
  allEntities: EntityWithDetails[];
  systemViews: EntityViewWithTenantAndUser[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.entities.update");
  const item = await getEntityGroup(params.id!);
  if (!item) {
    return redirect("/admin/entities/groups");
  }
  const data: LoaderData = {
    item,
    allEntities: await getAllEntities({ tenantId: null }),
    systemViews: (await getAllEntityViews({ type: "system" })).items,
  };
  return json(data);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action")?.toString();

  const item = await getEntityGroup(params.id!);
  if (!item) {
    return redirect("/admin/entities/groups");
  }

  if (action === "edit") {
    await verifyUserHasPermission(request, "admin.entities.update");
    const slug = form.get("slug")?.toString();
    const title = form.get("title")?.toString();
    const icon = form.get("icon")?.toString();
    const collapsible = Boolean(form.get("collapsible"));
    const section = form.get("section")?.toString() ?? null;
    const entities: { entityId: string; allViewId: string | null }[] = form.getAll("entities[]").map((f) => JSON.parse(f.toString()));

    const allGroups = await getAllEntityGroups();
    const existing = allGroups.find((f) => f.slug.trim() === slug?.trim() && f.id !== params.id);
    if (slug && existing) {
      return json({ error: "Group with this slug already exists" }, { status: 400 });
    }
    await updateEntityGroup(params.id!, {
      slug,
      title,
      icon,
      collapsible,
      section,
      entities,
    });
    return redirect("/admin/entities/groups");
  } else if (action === "delete") {
    await verifyUserHasPermission(request, "admin.entities.delete");
    await deleteEntityGroup(params.id!);
    return json({ success: t("shared.deleted") });
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();

  return (
    <div>
      <EntityGroupForm item={data.item} allEntities={data.allEntities} systemViews={data.systemViews} />
    </div>
  );
}
