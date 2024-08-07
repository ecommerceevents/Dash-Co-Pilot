import { ActionFunctionArgs, json, LoaderFunction, redirect, MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { Outlet, useSubmit } from "@remix-run/react";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import PlusIcon from "~/components/ui/icons/PlusIcon";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getTranslations } from "~/locale/i18next.server";
import { createPromptFlow } from "~/modules/promptBuilder/db/promptFlows.db.server";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { getAllPromptFlowGroups, getPromptFlowGroup, PromptFlowGroupWithDetails } from "~/modules/promptBuilder/db/promptFlowGroups.db.server";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import { OpenAIDefaults } from "~/modules/ai/utils/OpenAIDefaults";

type LoaderData = {
  title: string;
  items: PromptFlowGroupWithDetails[];
};
export const loader: LoaderFunction = async ({ request }) => {
  const { t } = await getTranslations(request);
  const data: LoaderData = {
    title: `${t("prompts.builder.title")} | Groups | ${process.env.APP_NAME}`,
    items: await getAllPromptFlowGroups(),
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
export const action = async ({ request }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action")?.toString();

  if (action === "add-prompt-flow") {
    const id = form.get("id")?.toString() ?? "";

    const promptFlowGroup = await getPromptFlowGroup(id);
    if (!promptFlowGroup) {
      return json({ error: t("shared.notFound") }, { status: 400 });
    }

    const promptFlow = await createPromptFlow({
      model: OpenAIDefaults.model,
      stream: false,
      title: `${promptFlowGroup.title}: Untitled #${promptFlowGroup.promptFlows.length + 1}`,
      description: "",
      actionTitle: "",
      executionType: "sequential",
      promptFlowGroupId: promptFlowGroup.id,
      inputEntityId: null,
      isPublic: true,
      templates: promptFlowGroup.templates.map((t) => ({
        order: t.order,
        title: t.title,
        template: "",
        temperature: OpenAIDefaults.temperature,
        maxTokens: 0,
      })),
    });

    // return json({ success: t("shared.success") });
    return redirect(`/admin/prompts/builder/${promptFlow.id}`);
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const submit = useSubmit();

  function onCreatePromptFlow(item: PromptFlowGroupWithDetails) {
    const form = new FormData();
    form.set("action", "add-prompt-flow");
    form.set("id", item.id);
    submit(form, {
      method: "post",
    });
  }
  return (
    <EditPageLayout
      title={"Groups"}
      buttons={
        <>
          <ButtonSecondary to="new">
            <PlusIcon className="h-3 w-3" />
            <div>{t("shared.new")}</div>
          </ButtonSecondary>
        </>
      }
    >
      <TableSimple
        items={data.items}
        actions={[
          {
            title: "Add Variant",
            onClick: (idx, item) => onCreatePromptFlow(item),
          },
          {
            title: t("shared.edit"),
            onClickRoute: (_, i) => `${i.id}`,
          },
        ]}
        headers={[
          {
            name: "title",
            title: "Title",
            value: (i) => (
              <div className="flex max-w-xs flex-col truncate">
                <div className="truncate text-base font-bold">{i.title}</div>
                <div className="truncate text-sm text-gray-500">{i.description}</div>
              </div>
            ),
          },
          {
            name: "templates",
            title: "Templates",
            value: (i) => (
              <div className="flex flex-col">
                {i.templates.map((t, idx) => (
                  <div key={idx} className="text-sm text-gray-500">
                    #{t.order} - {t.title}
                  </div>
                ))}
              </div>
            ),
            className: "w-full",
          },
          {
            name: "promptFlows",
            title: "Prompt Flows",
            value: (i) => (
              <div className="flex flex-col">
                {i.promptFlows.length === 0 && <div className="text-sm text-gray-500">No prompt flows</div>}
                {i.promptFlows.map((t, idx) => (
                  <div key={idx} className="text-sm text-gray-500">
                    {t.title}
                  </div>
                ))}
              </div>
            ),
          },
        ]}
        noRecords={
          <div className="p-12 text-center">
            <h3 className="mt-1 text-sm font-medium text-gray-900">No groups</h3>
            <p className="mt-1 text-sm text-gray-500">Group prompt flows that share the same template structure.</p>
          </div>
        }
      />

      <Outlet />

      <ActionResultModal actionData={actionData ?? undefined} showSuccess={false} />
    </EditPageLayout>
  );
}
