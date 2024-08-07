import { ActionFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Form, useActionData, useSubmit } from "@remix-run/react";
import { FormEvent, useRef } from "react";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { db } from "~/utils/db.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";

export const meta: MetaFunction = () => [{ title: "Danger" }];

type ActionData = {
  error?: string;
  success?: string;
};
export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "reset-all-data") {
    await verifyUserHasPermission(request, "admin.kb.delete");
    await db.knowledgeBaseCategory.deleteMany({});
    await db.knowledgeBaseArticle.deleteMany({});
    await db.knowledgeBase.deleteMany({});
    return json({ success: "Reset successful" });
  } else {
    return json({ error: "Invalid form" }, { status: 400 });
  }
};

export default function () {
  const actionData = useActionData<ActionData>();

  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onDelete();
  }
  function onDelete() {
    confirmDelete.current?.show("Reset all Knowledge Base data?");
  }

  function onConfirmedDelete() {
    const form = new FormData();
    form.set("action", "reset-all-data");
    submit(form, {
      method: "post",
    });
  }
  return (
    <div className="flex-1 overflow-x-auto xl:overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Danger</h1>

        <Form onSubmit={handleSubmit} method="post" className="divide-y-gray-200 mt-6 space-y-8 divide-y">
          <input name="action" value="reset-all-data" hidden readOnly />
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
            <div className="sm:col-span-6">
              <h2 className="text-xl font-medium text-gray-900">Reset all data</h2>
              <p className="mt-1 text-sm text-gray-500">Delete all knowledge base data</p>
            </div>
          </div>

          <div className="flex justify-end pt-8">
            <ButtonPrimary destructive type="submit">
              Reset all data
            </ButtonPrimary>
          </div>
        </Form>
      </div>
      <ActionResultModal actionData={actionData} showSuccess={false} />
      <ConfirmModal ref={confirmDelete} onYes={onConfirmedDelete} destructive />
    </div>
  );
}
