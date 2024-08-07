import { WorkflowCredential } from "@prisma/client";
import { MetaFunction } from "@remix-run/node";
import { Outlet, useSubmit } from "@remix-run/react";
import { useRef } from "react";
import { useTypedLoaderData } from "remix-typedjson";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import DateCell from "~/components/ui/dates/DateCell";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import TableSimple from "~/components/ui/tables/TableSimple";
import { WorkflowDto } from "~/modules/workflowEngine/dtos/WorkflowDto";
import { WorkflowsCredentialsApi } from "./credentials.api.server";

export const meta: MetaFunction = () => [{ title: "Workflow Credentials" }];

export default function WorkflowsCredentialsView() {
  const data = useTypedLoaderData<WorkflowsCredentialsApi.LoaderData>();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);

  function onDelete(item: WorkflowCredential) {
    confirmDelete.current?.setValue(item);
    confirmDelete.current?.show("Are you sure you want to delete this workflow?", "Delete", "No", "All blocks and executions will be deleted.");
  }
  function onDeleteConfirm(item: WorkflowDto) {
    const form = new FormData();
    form.set("action", "delete");
    form.set("id", item.id.toString() ?? "");
    submit(form, {
      method: "post",
    });
  }
  return (
    <EditPageLayout
      title="Credentials"
      buttons={
        <>
          <ButtonPrimary to="new">New</ButtonPrimary>
        </>
      }
    >
      <div className="space-y-3">
        <TableSimple
          headers={[
            {
              title: "Name",
              name: "name",
              value: (item) => <div className="select-all">{`{{$credentials.${item.name}}}`}</div>,
            },
            {
              title: "Value",
              name: "value",
              className: "w-full",
              value: (item) => <div className="max-w-sm truncate">{"".padEnd(36, "*")}</div>,
            },
            {
              title: "Created At",
              name: "createdAt",
              value: (item) => <DateCell date={item.createdAt} />,
            },
          ]}
          items={data.items}
          actions={[
            {
              title: "Delete",
              onClick: (_, i) => onDelete(i),
              destructive: true,
            },
          ]}
        />
      </div>
      <Outlet />

      <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirm} destructive />
    </EditPageLayout>
  );
}
