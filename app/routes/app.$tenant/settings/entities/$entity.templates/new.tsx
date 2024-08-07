import { ActionFunction, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useNavigate, useParams } from "@remix-run/react";
import { useTypedLoaderData } from "remix-typedjson";
import EntityTemplateForm from "~/components/entities/entityTemplates/EntityTemplateForm";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { getTranslations } from "~/locale/i18next.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { EntityWithDetails, getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { createEntityTemplate } from "~/utils/db/entities/entityTemplates.db.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";

type LoaderData = {
  title: string;
  entity: EntityWithDetails;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdOrNull({ request, params });
  const entity = await getEntityBySlug({ tenantId, slug: params.entity ?? "" });
  const data: LoaderData = {
    title: `Templates | ${process.env.APP_NAME}`,
    entity,
  };
  return json(data);
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdOrNull({ request, params });

  const entity = await getEntityBySlug({ tenantId, slug: params.entity! });

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const title = form.get("title")?.toString() ?? "";
  const config = form.get("config")?.toString() ?? "";

  if (action === "create") {
    try {
      await createEntityTemplate({
        entityId: entity.id,
        tenantId,
        title,
        config,
      });
      return redirect(UrlUtils.getModulePath(params, `entities/${params.entity}/templates`));
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  }
  return badRequest({ error: t("shared.invalidForm") });
};

export default function NewEntityTemplateRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const params = useParams();
  const navigate = useNavigate();
  function close() {
    navigate(UrlUtils.getModulePath(params, `entities/${params.entity}/templates`));
  }
  return (
    <SlideOverWideEmpty title="New Entity Template" open={true} className="sm:max-w-lg" onClose={close}>
      <EntityTemplateForm entity={data.entity} />
    </SlideOverWideEmpty>
  );
}
