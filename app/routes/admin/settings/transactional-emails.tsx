import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { EmailTemplate } from "~/application/dtos/email/EmailTemplate";
import emailTemplates from "~/application/emails/emailTemplates.server";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import XIcon from "~/components/ui/icons/XIcon";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getTranslations } from "~/locale/i18next.server";
import { useAdminData } from "~/utils/data/useAdminData";
import { createAdminLog } from "~/utils/db/logs.db.server";
import { getPostmarkTemplates, sendEmail } from "~/utils/email.server";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { createEmailTemplates, deleteEmailTemplate, getEmailTemplates } from "~/utils/services/emailService";

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

type LoaderData = {
  title: string;
  items: EmailTemplate[];
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.emails.view");
  const items = await getEmailTemplates();
  const { t } = await getTranslations(request);
  const data: LoaderData = {
    title: `${t("settings.admin.transactionalEmails.title")} | ${process.env.APP_NAME}`,
    items,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
  items?: EmailTemplate[];
};
const success = (data: ActionData) => json(data, { status: 200 });
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request }) => {
  const { t } = await getTranslations(request);

  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "create-all-email-templates") {
    const items = await getPostmarkTemplates();
    if (items.length > 0) {
      return redirect("/admin/settings/transactional-emails");
    }
    try {
      const templates = await emailTemplates();
      await createEmailTemplates(templates);
      await createAdminLog(request, "Created email templates", templates.map((f) => f.alias).join(", "));

      return success({
        success: "All templates created",
        items: await getEmailTemplates(),
      });
    } catch (e: any) {
      return badRequest({ error: e?.toString() });
    }
  } else if (action === "create-email-template") {
    try {
      const alias = form.get("alias")?.toString();
      if (!alias) {
        return badRequest({ error: `Alias ${alias} not found` });
      }

      const templates = await getEmailTemplates();
      await createEmailTemplates(templates, alias);
      await createAdminLog(request, "Created email template", alias);

      return success({
        success: "Template created",
        items: await getEmailTemplates(),
      });
    } catch (e: any) {
      return badRequest({ error: e?.toString() });
    }
  } else if (action === "delete-postmark-email") {
    try {
      const alias = form.get("alias")?.toString();
      if (!alias) {
        return badRequest({ error: `Alias ${alias} not found` });
      }
      await deleteEmailTemplate(alias);
      await createAdminLog(request, "Deleted email template", alias);

      return success({
        success: "Template deleted",
        items: await getEmailTemplates(),
      });
    } catch (e: any) {
      return badRequest({ error: e?.toString() });
    }
  } else if (action === "send-test") {
    const email = form.get("email")?.toString();
    const alias = form.get("alias")?.toString();
    if (!email) {
      return badRequest({ error: "Invalid email" });
    }
    if (!alias) {
      return badRequest({ error: "Invalid template" });
    }
    await sendEmail({ request, to: email, alias, data: {} });
    return success({
      success: "Test email sent",
    });
  }
  return badRequest({
    error: t("shared.invalidForm"),
  });
};

export default function AdminSettingsGeneral() {
  const adminData = useAdminData();
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation();
  const submit = useSubmit();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);

  const [items, setItems] = useState<EmailTemplate[]>(actionData?.items ?? data.items);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    if (actionData?.success) {
      // successModal.current?.show(t("shared.success"), actionData.success);
      setItems(actionData?.items ?? data.items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  function templateUrl(item: EmailTemplate) {
    return `https://account.postmarkapp.com/servers/${item.associatedServerId}/templates/${item.templateId}/edit`;
  }
  // function performPrimaryAction(item: EmailTemplate) {
  //   if (item.associatedServerId > 0) {
  //     sendTest(item);
  //   } else {
  //     createTemplate(item);
  //   }
  // }
  function sendTest(item: EmailTemplate): void {
    const email = window.prompt("Email", adminData.user?.email);
    if (!email || email.trim() === "") {
      return;
    }
    const form = new FormData();
    form.set("action", "send-test");
    form.set("alias", item.alias);
    form.set("email", email);
    submit(form, {
      method: "post",
    });
  }
  function createAllEmailTemplates() {
    const form = new FormData();
    form.set("action", "create-all-email-templates");
    submit(form, {
      method: "post",
    });
  }
  function createTemplate(item: EmailTemplate): void {
    const form = new FormData();
    form.set("action", "create-email-template");
    form.set("alias", item.alias);
    submit(form, {
      method: "post",
    });
  }
  function deleteTemplate(item: EmailTemplate): void {
    const form = new FormData();
    form.set("action", "delete-postmark-email");
    form.set("alias", item.alias);
    submit(form, {
      method: "post",
    });
  }
  function createdTemplates() {
    return data.items.filter((f) => f.active).length;
  }
  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8 lg:py-12">
      <div className="flex justify-between space-x-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("settings.admin.transactionalEmails.title")}</h1>
        <Form method="post" className="flex items-center space-x-2">
          <ButtonPrimary
            type="button"
            onClick={createAllEmailTemplates}
            disabled={loading || createdTemplates() > 0 || !getUserHasPermission(adminData, "admin.emails.create")}
          >
            {t("admin.emails.createAll")}
          </ButtonPrimary>
        </Form>
      </div>

      <TableSimple
        items={items}
        headers={[
          {
            name: "created",
            title: t("admin.emails.created"),
            value: (i) => <>{i.associatedServerId > 0 ? <CheckIcon className="h-4 w-4 text-teal-600" /> : <XIcon className="h-4 w-4 text-gray-300" />}</>,
          },
          {
            name: "alias",
            title: t("admin.emails.alias"),
            value: (i) => i.alias,
          },
          {
            name: "subject",
            title: t("admin.emails.subject"),
            value: (i) => i.subject,
            breakpoint: "lg",
          },
        ]}
        actions={[
          {
            title: t("shared.create"),
            onClick: (_, item) => createTemplate(item),
            hidden: (item) => item.associatedServerId > 0,
            disabled: (item) => loading || item.associatedServerId > 0 || !getUserHasPermission(adminData, "admin.emails.create"),
          },
          {
            title: t("shared.edit"),
            onClickRoute: (_, item) => templateUrl(item),
            hidden: (item) => !item.associatedServerId || !getUserHasPermission(adminData, "admin.emails.update"),
            disabled: (item) => loading || item.associatedServerId > 0 || !getUserHasPermission(adminData, "admin.emails.create"),
          },
          {
            title: t("admin.emails.sendTest"),
            onClick: (_, item) => sendTest(item),
            disabled: (item) => loading || item.alias.includes("layout") || item.associatedServerId <= 0,
          },
          {
            title: t("shared.delete"),
            onClick: (_, item) => deleteTemplate(item),
            destructive: true,
            disabled: (item) => loading || item.associatedServerId <= 0 || !getUserHasPermission(adminData, "admin.emails.delete"),
          },
        ]}
      />

      <SuccessModal ref={successModal} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}
