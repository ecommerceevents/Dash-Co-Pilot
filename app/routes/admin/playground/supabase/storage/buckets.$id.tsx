import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useActionData, useParams, useSubmit, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import ErrorBanner from "~/components/ui/banners/ErrorBanner";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import DateCell from "~/components/ui/dates/DateCell";
import ServerError from "~/components/ui/errors/ServerError";
import InputMedia from "~/components/ui/input/InputMedia";
import InputText from "~/components/ui/input/InputText";
import ShowPayloadModalButton from "~/components/ui/json/ShowPayloadModalButton";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import PreviewMediaModal from "~/components/ui/media/PreviewMediaModal";
import Modal from "~/components/ui/modals/Modal";
import TableSimple from "~/components/ui/tables/TableSimple";
import { deleteSupabaseFile, getSupabaseFilePublicUrl, getSupabaseFiles, storeSupabaseFile } from "~/utils/integrations/supabaseService";

export const meta: MetaFunction = () => {
  return [{ title: "Supabase Playground - Files" }];
};

type LoaderData = {
  files: Awaited<ReturnType<typeof getSupabaseFiles>>;
  error?: string;
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const data: LoaderData = {
    files: { data: [], error: null },
    error: "",
  };
  if (process.env.NODE_ENV !== "development") {
    data.error = "Not available in production";
  } else if (!process.env.SUPABASE_API_URL) {
    data.error = "Missing SUPABASE_API_URL .env variable";
  } else if (!process.env.SUPABASE_KEY) {
    data.error = "Missing SUPABASE_KEY .env variable (service_role, secret)";
  } else {
    const supabaseBucketId = params.id!;
    data.files = await getSupabaseFiles(supabaseBucketId);
  }
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
  publicUrl?: string;
};
export const action: ActionFunction = async ({ request, params }) => {
  if (process.env.NODE_ENV !== "development") {
    return json({ error: "Not available in production" }, { status: 400 });
  }
  const supabaseBucketId = params.id!;

  const form = await request.formData();
  const action = form.get("action");
  if (action === "file-save") {
    const name = form.get("name")?.toString();
    if (!name) {
      return json({ error: "Missing name" }, { status: 400 });
    }
    const files: MediaDto[] = form.getAll("files[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });
    if (files.length !== 1) {
      return json({ error: "Missing file" }, { status: 400 });
    }

    const storedFile = await storeSupabaseFile({
      bucket: supabaseBucketId,
      content: files[0].file,
      id: name,
      replace: true,
    });
    if (!storedFile) {
      return json({ error: "Error creating file" }, { status: 400 });
    }
    return json({ success: "File saved: " + storedFile });
  } else if (action === "file-delete") {
    const name = form.get("name")?.toString();
    if (!name) {
      return json({ error: "Missing id" }, { status: 400 });
    }
    await deleteSupabaseFile(supabaseBucketId, name);
    return json({ success: "File deleted" });
  } else if (action === "file-download") {
    const name = form.get("name")?.toString();
    if (!name) {
      return json({ error: "Missing name" }, { status: 400 });
    }
    const publicUrl = await getSupabaseFilePublicUrl(supabaseBucketId, name);
    if (!publicUrl) {
      return json({ error: "Error getting file" }, { status: 400 });
    }
    return json({ publicUrl });
  }
  return json({ error: "Invalid action" }, { status: 400 });
};

type SupabaseFileDto = { id: string; name: string };
export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();
  const params = useParams();

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<SupabaseFileDto>();
  const [previewFile, setPreviewFile] = useState<File>();

  useEffect(() => {
    if (actionData) {
      setIsAdding(false);
      setIsEditing(undefined);
    }
    if (actionData?.publicUrl) {
      window.open(actionData.publicUrl, "_blank");
    }
  }, [actionData]);

  function onDownload(item: SupabaseFileDto) {
    const form = new FormData();
    form.append("action", "file-download");
    form.append("name", item.name);
    submit(form, {
      method: "post",
    });
  }
  return (
    <EditPageLayout
      title="Supabase Playground - Files"
      withHome={false}
      menu={[
        {
          title: "Buckets",
          routePath: "/admin/playground/supabase/storage/buckets",
        },
        {
          title: params.id ?? "",
          routePath: "/admin/playground/supabase/storage/buckets",
        },
      ]}
      buttons={
        <>
          <ButtonPrimary onClick={() => setIsAdding(true)}>Add file</ButtonPrimary>
        </>
      }
    >
      {data.error ?? data.files.error ? (
        <ErrorBanner title="Error" text={data.error ?? data.files.error?.message} />
      ) : (
        <div>
          <TableSimple
            items={data.files.data}
            headers={[
              { name: "id", title: "ID", value: (i) => i.id },
              { name: "name", title: "Name", value: (i) => i.name },
              // { name: "owner", title: "Owner", value: (i) => i.owner },
              {
                name: "metadata",
                title: "Metadata",
                value: (i) => (
                  <pre className="max-w-xs truncate">
                    <ShowPayloadModalButton title="Metadata" payload={JSON.stringify(i.metadata, null, 2)} />
                  </pre>
                ),
              },
              {
                name: "createdAt",
                title: t("shared.createdAt"),
                value: (i) => <DateCell date={new Date(i.created_at)} />,
              },
              {
                name: "updatedAt",
                title: t("shared.updatedAt"),
                value: (i) => (i.updated_at ? <DateCell date={new Date(i.updated_at)} /> : null),
              },
              {
                name: "lastAccessedAt",
                title: t("shared.lastAccessedAt"),
                value: (i) => (i.last_accessed_at ? <DateCell date={new Date(i.last_accessed_at)} /> : null),
              },
            ]}
            actions={[
              {
                title: "Download",
                onClick: (_, i) => onDownload(i),
                firstColumn: true,
              },
              {
                title: "Edit",
                onClick: (_, i) => setIsEditing(i),
              },
            ]}
          />
        </div>
      )}

      {previewFile && (
        <PreviewMediaModal
          item={{
            title: "Preview",
            type: previewFile.type,
            name: previewFile.name,
            file: previewFile.toString(),
          }}
          onClose={() => setPreviewFile(undefined)}
          onDownload={() => {
            const downloadLink = document.createElement("a");
            downloadLink.href = previewFile.toString();
            downloadLink.download = previewFile.name;
            document.body.appendChild(downloadLink);
            downloadLink.click();
          }}
        />
      )}

      <Modal size="md" open={isAdding} setOpen={() => setIsAdding(false)}>
        <FileForm />
      </Modal>

      <Modal size="md" open={!!isEditing} setOpen={() => setIsEditing(undefined)}>
        <FileForm item={isEditing} />
      </Modal>
    </EditPageLayout>
  );
}

function FileForm({ item }: { item?: SupabaseFileDto }) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData<ActionData>();
  function onDelete() {
    if (!item || !confirm("Are you sure?")) {
      return;
    }
    const form = new FormData();
    form.set("action", "file-delete");
    form.set("name", item.name);
    submit(form, {
      method: "post",
    });
  }
  return (
    <Form method="post" className="flex flex-col space-y-4">
      <div>
        <input type="hidden" name="action" value="file-save" hidden readOnly />
        {item ? (
          <>
            <h2 className="text-xl font-bold">Edit File</h2>
            <input type="hidden" name="id" value={item.id} hidden readOnly />
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold">Create File</h2>
            <input type="hidden" name="action" value="file-save" hidden readOnly />
          </>
        )}
      </div>
      <InputText readOnly={!!item} name="name" title="Name" defaultValue={item?.name} />
      <InputMedia name="files" title="File" min={1} max={1} />

      <div className="flex justify-between space-x-2">
        <div>
          {item && (
            <ButtonSecondary disabled={navigation.state !== "idle"} destructive onClick={onDelete}>
              Delete
            </ButtonSecondary>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <LoadingButton type="submit">Save</LoadingButton>
        </div>
      </div>

      {actionData?.error && <ErrorBanner title="Error" text={actionData.error} />}
    </Form>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
