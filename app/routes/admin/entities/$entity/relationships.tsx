import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunctionArgs } from "@remix-run/node";
import { useNavigate, useOutlet } from "@remix-run/react";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import { EntityRelationshipWithDetails, getEntityRelationshipsWithCount, updateEntityRelationship } from "~/utils/db/entities/entityRelationships.db.server";
import { getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import EntityRelationshipsTable from "~/components/entities/relationships/EntityRelationshipsTable";
import { useTypedLoaderData } from "remix-typedjson";
import { getTranslations } from "~/locale/i18next.server";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";

type LoaderData = {
  items: (EntityRelationshipWithDetails & { _count: { rows: number } })[];
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const entity = await getEntityBySlug({ tenantId: null, slug: params.entity ?? "" });
  const items = await getEntityRelationshipsWithCount(entity.id);
  const data: LoaderData = {
    items,
  };
  return json(data);
};

export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";

  if (action === "set-orders") {
    const items: { id: string; order: number }[] = form.getAll("orders[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    await Promise.all(
      items.map(async ({ id, order }) => {
        await updateEntityRelationship(id, { order: Number(order) });
      })
    );
    return json({ updated: true });
  }
  return json({ error: t("shared.invalidForm") }, { status: 400 });
};

export default function EditEntityRelationshipsIndexRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const { t } = useTranslation();
  const outlet = useOutlet();
  const navigate = useNavigate();

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-sm font-medium leading-3 text-gray-800">{t("models.relationship.plural")}</h3>
        <EntityRelationshipsTable items={data.items} editable={true} />
        <div className="w-fu flex justify-start">
          <ButtonTertiary to="new">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-medium uppercase">{t("shared.add")}</span>
          </ButtonTertiary>
        </div>
      </div>

      <SlideOverWideEmpty
        title={""}
        open={!!outlet}
        onClose={() => {
          navigate(".", { replace: true });
        }}
        className="sm:max-w-md"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{outlet}</div>
        </div>
      </SlideOverWideEmpty>
    </>
  );
}
