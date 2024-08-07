import { ActionFunction, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useTypedLoaderData } from "remix-typedjson";
import EntityRelationshipForm from "~/components/entities/relationships/EntityRelationshipForm";
import { getTranslations } from "~/locale/i18next.server";
import { EntityWithDetails, getAllEntities, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import {
  deleteEntityRelationship,
  EntityRelationshipWithCount,
  findEntityRelationship,
  getEntityRelationship,
  updateEntityRelationship,
} from "~/utils/db/entities/entityRelationships.db.server";

type LoaderData = {
  entity: EntityWithDetails;
  entities: EntityWithDetails[];
  item: EntityRelationshipWithCount;
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const entity = await getEntityBySlug({ tenantId: null, slug: params.entity! });
  const item = await getEntityRelationship(params.id ?? "");
  if (!item) {
    return redirect(`/admin/entities/${params.entity}/relationships`);
  }
  const data: LoaderData = {
    entity,
    entities: await getAllEntities({ tenantId: null }),
    item,
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  // const entity = await getEntityBySlug({ tenantId: null, slug: params.entity! });
  let existing = await getEntityRelationship(params.id ?? "");
  if (!existing) {
    return badRequest({ error: t("shared.notFound") });
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  // const order = Number(form.get("order"));
  let title = form.get("title")?.toString() ?? null;
  const type = form.get("relationshipType")?.toString() ?? "one-to-many";
  const required = Boolean(form.get("required"));
  const cascade = Boolean(form.get("cascade"));
  const readOnly = Boolean(form.get("readOnly"));
  const hiddenIfEmpty = Boolean(form.get("hiddenIfEmpty"));
  const childEntityViewId = form.get("childEntityViewId")?.toString() ?? null;
  const parentEntityViewId = form.get("parentEntityViewId")?.toString() ?? null;

  if (title?.trim() === "") {
    title = null;
  }
  if (action === "edit") {
    existing = await findEntityRelationship({ parentId: existing.parentId, childId: existing.childId, title, notIn: [existing.id] });
    if (existing) {
      return badRequest({ error: "Relationship already exists" });
    }
    try {
      await updateEntityRelationship(params.id ?? "", {
        // order,
        title,
        type,
        required,
        cascade,
        readOnly,
        hiddenIfEmpty,
        childEntityViewId: childEntityViewId?.length ? childEntityViewId : null,
        parentEntityViewId: parentEntityViewId?.length ? parentEntityViewId : null,
      });
      return redirect(`/admin/entities/${params.entity}/relationships`);
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  } else if (action === "delete") {
    if (existing._count.rows > 0) {
      return badRequest({ error: "You cannot delete a relationship that has rows: " + existing.id });
    }
    await deleteEntityRelationship(existing.id);
    return redirect(`/admin/entities/${params.entity}/relationships`);
  }
  return badRequest({ error: t("shared.invalidForm") });
};

export default function EditEntityRelationshipRoute() {
  const data = useTypedLoaderData<LoaderData>();
  return (
    <div>
      <EntityRelationshipForm entity={data.entity} entities={data.entities} item={data.item} />
    </div>
  );
}
