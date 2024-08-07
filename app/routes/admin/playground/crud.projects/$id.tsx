import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { useActionData, useSearchParams, useSubmit } from "@remix-run/react";
import ServerError from "~/components/ui/errors/ServerError";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import FakeProjectOverview from "~/modules/fake/fakeProjectsCrud/components/FakeProjectOverview";
import { FakeProjectDto } from "~/modules/fake/fakeProjectsCrud/dtos/FakeProjectDto";
import { FakeProjectService } from "~/modules/fake/fakeProjectsCrud/services/FakeCrudService";
import FakeProjectForm from "~/modules/fake/fakeProjectsCrud/components/FakeProjectForm";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import { FakeTaskDto } from "~/modules/fake/fakeProjectsCrud/dtos/FakeTaskDto";
import { useTypedLoaderData } from "remix-typedjson";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metadata || [];

type LoaderData = {
  item?: FakeProjectDto;
  metadata: [{ title: string }];
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const item = await FakeProjectService.get(params.id!);
  if (!item) {
    return redirect("/admin/playground/crud/projects");
  }
  const data: LoaderData = {
    metadata: [{ title: item.name }],
    item,
  };
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
};
export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "edit") {
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
      try {
        await FakeProjectService.update(params.id!, {
          name,
          description,
          active,
          tasks,
        });
        return json({ success: "Project updated" });
      } catch (e: any) {
        return json({ error: e.message }, { status: 400 });
      }
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else if (action === "complete-task") {
    try {
      const projectId = form.get("project-id")?.toString() ?? "";
      const taskId = form.get("task-id")?.toString() ?? "";
      await FakeProjectService.completeTask(projectId, taskId);
      return json({ success: "Task completed" });
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else if (action === "delete") {
    try {
      await FakeProjectService.del(params.id!);
      return redirect("/admin/playground/crud/projects");
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else {
    return json({ error: "Invalid action" }, { status: 400 });
  }
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <EditPageLayout
      title="Edit Fake Project"
      menu={[
        {
          title: "Fake Projects",
          routePath: "/admin/playground/crud/projects",
        },
        {
          title: data.item?.name ?? "Edit",
          routePath: "/admin/playground/crud/projects/" + data.item?.id,
        },
      ]}
    >
      <div className="flex items-center justify-between space-x-2">
        <h1 className="truncate text-lg font-bold text-gray-800">{data.item?.name}</h1>
        <ButtonSecondary
          onClick={() => {
            if (searchParams.get("editing")) {
              setSearchParams({});
            } else {
              setSearchParams(new URLSearchParams({ editing: "true" }));
            }
          }}
        >
          {searchParams.get("editing") ? "Cancel" : "Edit"}
        </ButtonSecondary>
      </div>

      {data.item && (
        <>
          <div className="mx-auto space-y-2">
            {searchParams.get("editing") ? (
              <FakeProjectForm
                item={data.item}
                actionData={actionData}
                canDelete={true}
                onCancel={() => {
                  setSearchParams({});
                }}
              />
            ) : (
              <FakeProjectOverview
                item={data.item}
                actionData={actionData}
                onCompleteTask={(s) => {
                  const form = new FormData();
                  form.append("action", "complete-task");
                  form.append("project-id", data.item?.id ?? "");
                  form.append("task-id", s.id);
                  submit(form, {
                    method: "post",
                  });
                }}
              />
            )}
          </div>
        </>
      )}
    </EditPageLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
