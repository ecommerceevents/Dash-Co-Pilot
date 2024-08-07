import { ActionFunction, json, MetaFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import ErrorBanner from "~/components/ui/banners/ErrorBanner";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import DateCell from "~/components/ui/dates/DateCell";
import ServerError from "~/components/ui/errors/ServerError";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import InputText from "~/components/ui/input/InputText";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import Modal from "~/components/ui/modals/Modal";
import TableSimple from "~/components/ui/tables/TableSimple";
import {
  deleteSupabaseBucket,
  getOrCreateSupabaseBucket,
  getSupabaseBuckets,
  getSupabaseFiles,
  updateSupabaseBucket,
} from "~/utils/integrations/supabaseService";

export const meta: MetaFunction = () => {
  return [{ title: "Supabase Playground - Buckets" }];
};

type LoaderData = {
  buckets: Awaited<ReturnType<typeof getSupabaseBuckets>>;
  files: {
    [bucketId: string]: Awaited<ReturnType<typeof getSupabaseFiles>>;
  };
  error?: string;
};
export const loader = async () => {
  const data: LoaderData = {
    buckets: { data: [], error: null },
    files: {},
    error: "",
  };
  if (process.env.NODE_ENV !== "development") {
    data.error = "Not available in production";
  } else if (!process.env.SUPABASE_API_URL) {
    data.error = "Missing SUPABASE_API_URL .env variable";
  } else if (!process.env.SUPABASE_KEY) {
    data.error = "Missing SUPABASE_KEY .env variable (service_role, secret)";
  } else {
    data.buckets = await getSupabaseBuckets();
    if (data.buckets.data) {
      await Promise.all(
        data.buckets.data.map(async (bucket) => {
          data.files[bucket.id] = await getSupabaseFiles(bucket.id);
        })
      );
    }
  }
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
};
export const action: ActionFunction = async ({ request }) => {
  if (process.env.NODE_ENV !== "development") {
    return json({ error: "Not available in production" }, { status: 400 });
  }
  const form = await request.formData();
  const action = form.get("action");
  if (action === "bucket-create") {
    const name = form.get("name")?.toString();
    const isPublic = form.get("public");
    if (!name) {
      return json({ error: "Missing name" }, { status: 400 });
    }
    await getOrCreateSupabaseBucket(name, isPublic === "true" || isPublic === "on");
    return json({ success: "Bucket created" });
  } else if (action === "bucket-update") {
    const id = form.get("id")?.toString();
    if (!id) {
      return json({ error: "Missing id" }, { status: 400 });
    }
    const isPublic = form.get("public");
    await updateSupabaseBucket(id, {
      public: isPublic === "true" || isPublic === "on",
    });
    return json({ success: "Bucket updated" });
  } else if (action === "bucket-delete") {
    const id = form.get("id")?.toString();
    if (!id) {
      return json({ error: "Missing id" }, { status: 400 });
    }
    const bucketFiles = await getSupabaseFiles(id);
    if (bucketFiles.data?.length) {
      return json({ error: "Bucket is not empty" }, { status: 400 });
    }
    const deleted = await deleteSupabaseBucket(id);
    if (deleted.error) {
      return json({ error: deleted.error.name }, { status: 400 });
    }
    return json({ success: "Bucket deleted" });
  } else {
    return json({ error: "Invalid action" }, { status: 400 });
  }
};

type SupabaseBucketDto = { id: string; name: string; public: boolean };
export default function () {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<SupabaseBucketDto>();

  useEffect(() => {
    if (actionData) {
      setIsAdding(false);
      setIsEditing(undefined);
    }
  }, [actionData]);

  return (
    <IndexPageLayout
      title="Supabase Playground - Buckets"
      buttons={
        <>
          <ButtonPrimary onClick={() => setIsAdding(true)}>Create</ButtonPrimary>
        </>
      }
    >
      {data.error ?? data.buckets.error ? (
        <ErrorBanner title="Error" text={data.error ?? data.buckets.error?.toString()} />
      ) : (
        <div>
          <TableSimple
            items={data.buckets.data.sort((a, b) => b.created_at.localeCompare(a.created_at))}
            headers={[
              { name: "id", title: "ID", value: (i) => i.id, className: "w-full" },
              // { name: "name", title: "Name", value: (i) => i.name },
              // { name: "owner", title: "Owner", value: (i) => i.owner },
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
                name: "visibility",
                title: "Visibility",
                value: (i) => (i.public ? <SimpleBadge title="Public" color={Colors.GREEN} /> : <SimpleBadge title="Private" color={Colors.RED} />),
              },
              {
                name: "files",
                title: "Files",
                value: (i) => data.files[i.id]?.data?.length ?? 0,
              },
            ]}
            actions={[
              {
                title: "Edit",
                onClick: (_, i) => setIsEditing(i),
              },
              {
                title: "Files",
                onClickRoute: (_, i) => `${i.id}`,
              },
            ]}
          />
        </div>
      )}

      <Modal size="md" open={isAdding} setOpen={() => setIsAdding(false)}>
        <BucketForm />
      </Modal>

      <Modal size="md" open={!!isEditing} setOpen={() => setIsEditing(undefined)}>
        <BucketForm item={isEditing} />
      </Modal>
    </IndexPageLayout>
  );
}

function BucketForm({ item }: { item?: SupabaseBucketDto }) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData<ActionData>();

  function onDelete() {
    if (!item || !confirm("Are you sure?")) {
      return;
    }
    const form = new FormData();
    form.set("action", "bucket-delete");
    form.set("id", item.id);
    submit(form, {
      method: "post",
    });
  }
  return (
    <Form method="post" className="flex flex-col space-y-4">
      <div>
        {item ? (
          <>
            <h2 className="text-xl font-bold">Edit Bucket</h2>

            <input type="hidden" name="action" value="bucket-update" hidden readOnly />
            <input type="hidden" name="id" value={item.id} hidden readOnly />
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold">Create Bucket</h2>

            <input type="hidden" name="action" value="bucket-create" hidden readOnly />
          </>
        )}
      </div>
      <InputText name="name" title="Name" defaultValue={item?.name} disabled={!!item?.name} />
      <InputCheckboxWithDescription name="public" title="Public" description="Files will be publicly accessible" value={item?.public} />

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
