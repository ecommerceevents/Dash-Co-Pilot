import { ActionFunction, json, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ServerError from "~/components/ui/errors/ServerError";
import NotificationTemplatesTable from "~/modules/notifications/components/NotificationTemplatesTable";
import { NotificationChannelDto, NotificationChannels } from "~/modules/notifications/services/NotificationChannels";
import NotificationService, { IGetTemplatesData } from "~/modules/notifications/services/.server/NotificationService";
import { getUser } from "~/utils/db/users.db.server";
import { getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { getUserInfo } from "~/utils/session.server";
import toast from "react-hot-toast";

type LoaderData = {
  items: IGetTemplatesData | null;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const items = await NotificationService.getNotificationTemplates({
    limit: 100,
    page: currentPagination.page - 1,
  });
  const data: LoaderData = {
    items,
  };
  return json(data);
};
type ActionData = {
  error?: string;
  success?: string;
};
export const action: ActionFunction = async ({ request, params }) => {
  const userInfo = await getUserInfo(request);
  const form = await request.formData();
  const user = await getUser(userInfo.userId);
  const action = form.get("action");
  if (action === "delete") {
    const id = form.get("id")?.toString() ?? "";
    try {
      await NotificationService.deleteNotificationTemplate(id.toString());
      return json({
        success: `Notification template deleted`,
      });
    } catch (e: any) {
      return json({ error: e.message }, { status: 500 });
    }
  } else if (action === "create") {
    // const name = form.get("name")?.toString() ?? "";
    // const description = form.get("description")?.toString() ?? "";
    try {
      // await NotificationService.createNotificationTemplate({
      //   notificationGroupId: "",
      //   name,
      //   description,
      //   steps: [],
      //   active: true,
      //   draft: false,
      //   critical: false,
      // });
      return json({ success: `TODO` });
    } catch (e: any) {
      return json({ error: e.message }, { status: 500 });
    }
  } else if (action === "send-preview") {
    const channel = form.get("channel")?.toString() ?? "";
    try {
      await NotificationService.send({
        channel,
        to: user!,
        notification: {
          message: "This is a test message to #" + channel,
        },
      });
      return json({ success: `Preview sent to channel: ` + channel });
    } catch (e: any) {
      return json({ error: e.message }, { status: 500 });
    }
  }
};

export default function () {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();

  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    let missingTemplate = false;
    NotificationChannels.forEach((i) => {
      if (!data.items?.data.find((t) => t.name === i.name)) {
        missingTemplate = true;
      }
    });
    if (missingTemplate) {
      setShowSetup(true);
    }
  }, [data.items?.data]);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData?.error);
    } else if (actionData?.success) {
      toast.success(actionData?.success);
    }
  }, [actionData]);

  // function onCreate({ name, description }: { name: string; description: string }) {
  //   const form = new FormData();
  //   form.append("action", "create");
  //   form.append("name", name);
  //   form.append("description", description);
  //   submit(form, {
  //     method: "post",
  //   });
  // }
  function onDelete(id: string) {
    const form = new FormData();
    form.append("action", "delete");
    form.append("id", id);
    submit(form, {
      method: "post",
    });
  }
  function onSendPreview(item: NotificationChannelDto) {
    const form = new FormData();
    form.append("action", "send-preview");
    form.append("channel", item.name);
    submit(form, {
      method: "post",
    });
  }
  return (
    <>
      <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
        <div className="md:border-b md:border-gray-200 md:py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground text-lg font-medium leading-6">Channels / Notification templates</h3>
            {!showSetup && <ButtonSecondary onClick={() => setShowSetup(true)}>Show set up instructions</ButtonSecondary>}
          </div>
        </div>

        {showSetup && <SetUpInstructions />}

        <NotificationTemplatesTable items={data.items} onDelete={onDelete} onSendPreview={onSendPreview} />
      </div>
    </>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}

function SetUpInstructions() {
  return (
    <InfoBanner title="Default In-app Notifications" text="">
      <div className="space-y-2">
        <div>
          Go to each notification template, and add a <i className="border-b border-gray-300">Step</i> in the Workflow Editor of type{" "}
          <i className="border-b border-gray-300">in-app</i> with the following fields:
          <ul>
            <li>
              ◉ <b>Content</b> <span className="text-red-500">*</span>: <span className="select-all">{"{{message}}"}</span>
            </li>
            <li>
              ◉ <b>Redirect URL</b> <i>(optional)</i>: <span className="select-all">{"{{action.url}}"}</span>
            </li>
          </ul>
        </div>
      </div>
    </InfoBanner>
  );
}
