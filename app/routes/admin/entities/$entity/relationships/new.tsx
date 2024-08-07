import { ActionFunction, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useTypedLoaderData } from "remix-typedjson";
import EntityRelationshipForm from "~/components/entities/relationships/EntityRelationshipForm";
import { getTranslations } from "~/locale/i18next.server";
import { EntityWithDetails, getAllEntities, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { createEntityRelationship, getEntityRelationships, findEntityRelationship } from "~/utils/db/entities/entityRelationships.db.server";

type LoaderData = {
  title: string;
  entity: EntityWithDetails;
  entities: EntityWithDetails[];
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const entity = await getEntityBySlug({ tenantId: null, slug: params.entity! });
  const data: LoaderData = {
    title: `Relationships | ${process.env.APP_NAME}`,
    entity,
    entities: await getAllEntities({ tenantId: null }),
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);

  const entity = await getEntityBySlug({ tenantId: null, slug: params.entity! });
  if (!entity) {
    return redirect("/admin/entities");
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const parentId = form.get("parentId")?.toString() ?? entity.id;
  const childId = form.get("childId")?.toString() ?? entity.id;
  let title = form.get("title")?.toString().trim() ?? null;
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
  if (action === "create") {
    const existing = await findEntityRelationship({ parentId, childId, title });
    if (existing) {
      return badRequest({ error: "Relationship already exists" });
    }
    const allRelationships = await getEntityRelationships(entity.id);
    let maxOrder = 0;
    if (allRelationships.length > 0) {
      maxOrder = Math.max(...allRelationships.map((f) => f.order ?? 0));
    }
    try {
      await createEntityRelationship({
        parentId,
        childId,
        order: maxOrder + 1,
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
  }
  return badRequest({ error: t("shared.invalidForm") });
};

export default function NewEntityRelationshipRoute() {
  const data = useTypedLoaderData<LoaderData>();
  return (
    <div>
      <EntityRelationshipForm entity={data.entity} entities={data.entities} />
    </div>
  );
}
