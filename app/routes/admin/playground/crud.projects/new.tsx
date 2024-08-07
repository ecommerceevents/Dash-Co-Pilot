import { ActionFunction, json, MetaFunction, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import NewPageLayout from "~/components/ui/layouts/NewPageLayout";
import { useTranslation } from "react-i18next";
import { FakeProjectService } from "~/modules/fake/fakeProjectsCrud/services/FakeCrudService";
import FakeProjectForm from "~/modules/fake/fakeProjectsCrud/components/FakeProjectForm";
import { FakeTaskDto } from "~/modules/fake/fakeProjectsCrud/dtos/FakeTaskDto";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metadata || [];

type LoaderData = {
  metadata: [{ title: string }];
};
export const loader = async () => {
  const data: LoaderData = {
    metadata: [{ title: "Create Fake Project" }],
  };
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
};
export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "create") {
    try {
      const name = form.get("name")?.toString() ?? "";
      const description = form.get("description")?.toString();
      const tasks: Partial<FakeTaskDto>[] = form.getAll("tasks[]").map((f: FormDataEntryValue) => {
        return JSON.parse(f.toString());
      });
      const isActive = form.get("isActive");
      const active = isActive ? isActive.toString() === "on" || isActive.toString() === "true" : false;

      if (!name) {
        throw Error("Please fill all fields");
      }

      if (tasks.length === 0) {
        throw Error("Please add at least one task");
      }

      const item = await FakeProjectService.create({
        name,
        description,
        active,
        tasks,
      });
      return redirect(`/admin/playground/crud/projects/${item.id}`);
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else {
    return json({ error: "Invalid action" }, { status: 400 });
  }
};

export default function () {
  const { t } = useTranslation();
  const actionData = useActionData<ActionData>();

  return (
    <NewPageLayout
      title="Create Fake Project"
      menu={[
        {
          title: "Fake Projects",
          routePath: "/admin/playground/crud/projects",
        },
        {
          title: t("shared.create"),
          routePath: "/admin/playground/crud/projects/create",
        },
      ]}
    >
      <div className="mx-auto max-w-2xl">
        <FakeProjectForm actionData={actionData} />
      </div>
    </NewPageLayout>
  );
}
