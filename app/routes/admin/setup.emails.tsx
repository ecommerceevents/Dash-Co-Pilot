import { EmailTemplate } from "~/application/dtos/email/EmailTemplate";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import { getPostmarkTemplates, sendEmail } from "~/utils/email.server";
import emailTemplates from "~/application/emails/emailTemplates.server";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { getTranslations } from "~/locale/i18next.server";
import { createEmailTemplates, deleteEmailTemplate, getEmailTemplates } from "~/utils/services/emailService";
import Breadcrumb from "~/components/ui/breadcrumbs/Breadcrumb";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import { useAdminData } from "~/utils/data/useAdminData";
import { createAdminLog } from "~/utils/db/logs.db.server";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import ServerError from "~/components/ui/errors/ServerError";

type LoaderData = {
  title: string;
  items: EmailTemplate[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.emails.view");
  const { t } = await getTranslations(request);

  const items = await getEmailTemplates();

  const data: LoaderData = {
    title: `${t("admin.emails.title")} | ${process.env.APP_NAME}`,
    items,
  };

  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

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
      return redirect("/admin/setup/emails");
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

export default function EmailsRoute() {
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

  const headers = [
    {
      title: t("admin.emails.created"),
    },
    // {
    //   title: t("admin.emails.name"),
    // },
    {
      title: t("admin.emails.alias"),
    },
    {
      title: t("admin.emails.subject"),
    },
    {
      title: t("shared.actions"),
    },
  ];

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
    <div>
      <Breadcrumb
        className="w-full"
        home="/admin/dashboard"
        menu={[
          { title: t("app.sidebar.setup"), routePath: "/admin/setup" },
          { title: t("admin.emails.title"), routePath: "/admin/setup/emails" },
        ]}
      />
      <div className="w-full border-b border-gray-300 bg-white py-2 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between space-x-2 px-4 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-screen-2xl">
          <h1 className="flex flex-1 items-center truncate font-bold">{t("admin.emails.title")}</h1>
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
      </div>

      <div className="mx-auto max-w-5xl space-y-2 px-4 pt-2 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-screen-2xl">
        <div className="flex flex-col">
          {(() => {
            if (items.length === 0) {
              return (
                <EmptyState
                  className="bg-white"
                  captions={{
                    thereAreNo: t("admin.emails.noEmails"),
                    description: t("admin.emails.noEmailsDescription"),
                  }}
                />
              );
            } else {
              return (
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full py-2 align-middle">
                    {/* {!data.onPostmark && (
                      <WarningBanner title={t("shared.warning")} text={t("admin.emails.notSaved")}>
                        <div className="text-sm leading-5 right-0 -ml-3 mt-2">
                          <span className="inline-flex rounded-sm ml-2">
                            <button
                              disabled={loading}
                              type="submit"
                              className={clsx(
                                "ml-1 h-8 inline-flex items-center px-4 py-2 border border-orange-200 text-xs leading-5 font-medium rounded-sm text-orange-700 bg-orange-100 focus:outline-none transition duration-150 ease-in-out",
                                loading ? "bg-opacity-80 cursor-not-allowed" : "hover:bg-orange-200"
                              )}
                            >
                              {t("admin.emails.generateFromFiles")}
                            </button>
                          </span>
                        </div>
                      </WarningBanner>
                    )} */}
                    <div className="overflow-hidden border border-gray-200 shadow sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {headers.map((header, idx) => {
                              return (
                                <th
                                  key={idx}
                                  scope="col"
                                  className="max-w-xs select-none truncate px-1.5 py-1 text-left text-xs font-medium tracking-wider text-gray-500"
                                >
                                  <div className="flex items-center space-x-1 text-gray-500">
                                    <div>{header.title}</div>
                                  </div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {items.map((item, idx) => {
                            return (
                              <tr key={idx}>
                                <td className="max-w-xs truncate whitespace-nowrap px-1.5 py-1 text-sm text-gray-600">
                                  <div className="flex justify-center">
                                    {(() => {
                                      if (item.associatedServerId > 0) {
                                        return (
                                          <svg xmlns="http://www.w3.org/2000/svg" className="text-theme-600 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                              fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        );
                                      } else {
                                        return (
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                              fillRule="evenodd"
                                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        );
                                      }
                                    })()}
                                  </div>
                                </td>
                                {/* <td className="px-1.5 py-1 max-w-xs truncate whitespace-nowrap text-sm text-gray-600">{item.name}</td> */}
                                <td className="max-w-xs truncate whitespace-nowrap px-1.5 py-1 text-sm text-gray-600">{item.alias}</td>
                                <td className="max-w-xs truncate whitespace-nowrap px-1.5 py-1 text-sm text-gray-600">{item.subject}</td>
                                <td className="max-w-xs truncate whitespace-nowrap px-1.5 py-1 text-sm text-gray-600">
                                  <div className="flex items-center space-x-2">
                                    {item.associatedServerId <= 0 ? (
                                      <ButtonTertiary
                                        className="w-14 py-1"
                                        disabled={loading || item.associatedServerId > 0 || !getUserHasPermission(adminData, "admin.emails.create")}
                                        onClick={() => createTemplate(item)}
                                      >
                                        {t("shared.create")}
                                      </ButtonTertiary>
                                    ) : (
                                      <>
                                        {getUserHasPermission(adminData, "admin.emails.update") && (
                                          <a
                                            className="text-theme-600 inline-flex w-14 items-center space-x-2 px-1 py-1 text-sm font-medium focus:outline-none"
                                            href={templateUrl(item)}
                                            rel="noreferrer"
                                            target="_blank"
                                          >
                                            {t("shared.edit")}
                                          </a>
                                        )}
                                      </>
                                    )}
                                    <ButtonTertiary
                                      className="py-1"
                                      disabled={loading || item.alias.includes("layout") || item.associatedServerId <= 0}
                                      onClick={() => sendTest(item)}
                                    >
                                      {t("admin.emails.sendTest")}
                                    </ButtonTertiary>

                                    <ButtonTertiary
                                      className="py-1"
                                      destructive={true}
                                      disabled={loading || item.associatedServerId <= 0 || !getUserHasPermission(adminData, "admin.emails.delete")}
                                      onClick={() => deleteTemplate(item)}
                                    >
                                      {t("shared.delete")}
                                    </ButtonTertiary>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            }
          })()}
        </div>
      </div>

      <SuccessModal ref={successModal} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
