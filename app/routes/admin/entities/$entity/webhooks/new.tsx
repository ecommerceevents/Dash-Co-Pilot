import { ActionFunction, json, redirect } from "@remix-run/node";
import { useNavigate, useParams } from "@remix-run/react";
import EntityWebhookForm from "~/components/entities/webhooks/EntityWebhookForm";
import OpenModal from "~/components/ui/modals/OpenModal";
import { getTranslations } from "~/locale/i18next.server";
import { getEntityBySlug } from "~/utils/db/entities/entities.db.server";
import { createEntityWebhook } from "~/utils/db/entities/entityWebhooks.db.server";

type LoaderData = {
  title: string;
};
export const loader = async () => {
  const data: LoaderData = {
    title: `Webhooks | ${process.env.APP_NAME}`,
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
  const webhookAction = form.get("webhook-action")?.toString() ?? "";
  const method = form.get("webhook-method")?.toString() ?? "";
  const endpoint = form.get("webhook-endpoint")?.toString() ?? "";

  if (action === "create") {
    try {
      await createEntityWebhook({
        entityId: entity.id,
        action: webhookAction,
        method,
        endpoint,
      });
      return redirect(`/admin/entities/${params.entity}/webhooks`);
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  }
  return badRequest({ error: t("shared.invalidForm") });
};

export default function NewEntityWebhookRoute() {
  const params = useParams();
  const navigate = useNavigate();
  function close() {
    navigate(`/admin/entities/${params.entity}/webhooks`);
  }
  return (
    <OpenModal className="sm:max-w-sm" onClose={close}>
      <EntityWebhookForm />
    </OpenModal>
  );
}
