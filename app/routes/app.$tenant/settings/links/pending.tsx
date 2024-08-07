import { useTranslation } from "react-i18next";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import DateUtils from "~/utils/shared/DateUtils";
import { useRef, useState, useEffect } from "react";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useNavigation, useSubmit } from "@remix-run/react";
import { getLinkedAccounts, updateLinkedAccount, getLinkedAccount, LinkedAccountWithDetails } from "~/utils/db/linkedAccounts.db.server";
import { LinkedAccountStatus } from "~/application/enums/tenants/LinkedAccountStatus";
import { useAppData } from "~/utils/data/useAppData";
import { loadAppData } from "~/utils/data/.server/appData";
import { sendEmail } from "~/utils/email.server";
import { getUser } from "~/utils/db/users.db.server";
import clsx from "clsx";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { getTranslations } from "~/locale/i18next.server";
import { getBaseURL } from "~/utils/url.server";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";

type LoaderData = {
  metatags: MetaTagsDto;
  items: LinkedAccountWithDetails[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);

  const items = await getLinkedAccounts(tenantId, LinkedAccountStatus.PENDING);
  const data: LoaderData = {
    metatags: [{ title: `${t("app.linkedAccounts.pending.multiple")} | ${process.env.APP_NAME}` }],
    items,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
  items?: LinkedAccountWithDetails[];
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "app.$tenant.settings.links.pending");
  const { t } = await getTranslations(request);
  const appData = await time(loadAppData({ request, params, t }, time), "loadAppData");

  const form = await request.formData();
  const linkId = form.get("linked-account-id")?.toString();
  if (!linkId) {
    return badRequest({ error: "Invalid link" });
  }
  const link = await getLinkedAccount(linkId);
  const accepted = form.get("accepted")?.toString() === "true";

  if (!link) {
    return badRequest({
      error: "Link not found",
    });
  }

  const user = await getUser(link?.createdByUserId);
  if (!user) {
    return badRequest({
      error: "Invalid user",
    });
  }

  await updateLinkedAccount(linkId, {
    status: accepted ? LinkedAccountStatus.LINKED : LinkedAccountStatus.REJECTED,
  });

  if (accepted) {
    await sendEmail({
      request,
      to: user.email,
      alias: "link-invitation-accepted",
      data: {
        action_url: getBaseURL(request) + `/app/settings/{:TODO_TENANT}/links`,
        name: user.firstName,
        user_invitee_name: appData.user?.firstName,
        user_invitee_email: appData.user?.email,
        tenant_invitee: appData.currentTenant?.name,
        action_text: "View tenant relationships",
      },
    });
  } else {
    await sendEmail({
      request,
      to: user.email,
      alias: "link-invitation-rejected",
      data: {
        action_url: getBaseURL(request) + `/app/{:TODO_TENANT}/settings/linked-accounts`,
        name: user.firstName,
        email: appData.user?.email,
        tenant: appData.currentTenant?.name,
        action_text: "View tenant relationships",
      },
    });
  }

  const tenantId = await getTenantIdFromUrl(params);
  return json(
    {
      items: await getLinkedAccounts(tenantId, LinkedAccountStatus.PENDING),
    },
    { headers: getServerTimingHeader() }
  );
};

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags ?? [];

export default function PendingLinksRoute() {
  const appData = useAppData();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";
  const submit = useSubmit();

  const errorModal = useRef<RefErrorModal>(null);
  const modalReject = useRef<RefConfirmModal>(null);
  const modalAccept = useRef<RefConfirmModal>(null);

  const [items] = useState(actionData?.items ?? data.items);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  function reject(item: LinkedAccountWithDetails) {
    const whoAmIName = whoAmI(item) === 0 ? t("models.provider.object") : t("models.client.object");
    if (modalReject.current) {
      modalReject.current.setValue(item);
      modalReject.current.show(
        t("app.linkedAccounts.invitation.confirmReject"),
        t("shared.reject"),
        t("shared.back"),
        t("app.linkedAccounts.invitation.rejectWarning", { 0: whoAmIName, 1: inviterTenant(item).name })
      );
    }
  }
  function accept(item: LinkedAccountWithDetails) {
    const whoAmIName = whoAmI(item) === 0 ? t("models.provider.object") : t("models.client.object");
    if (modalAccept.current) {
      modalAccept.current.setValue(item);
      modalAccept.current.show(
        t("app.linkedAccounts.invitation.confirmAccept", { 0: whoAmIName }),
        t("shared.accept"),
        t("shared.back"),
        t("app.linkedAccounts.invitation.acceptWarning", { 0: inviterTenant(item).name })
      );
    }
  }
  function accepted(item: LinkedAccountWithDetails) {
    item.status = 1;
    const form = new FormData();
    form.set("linked-account-id", item.id);
    form.set("accepted", "true");
    submit(form, {
      method: "post",
    });
  }
  function rejected(item: LinkedAccountWithDetails) {
    item.status = 2;
    const form = new FormData();
    form.set("linked-account-id", item.id);
    form.set("accepted", "false");
    submit(form, {
      method: "post",
    });
  }
  function whoAmI(item: LinkedAccountWithDetails) {
    if (appData.currentTenant?.id ?? "" === item.providerTenantId) {
      return 0;
    }
    return 1;
  }
  function inviterTenant(item: LinkedAccountWithDetails) {
    if (item.createdByTenantId === item.providerTenantId) {
      return item.providerTenant;
    }
    return item.clientTenant;
  }
  function dateAgo(value: Date) {
    return DateUtils.dateAgo(value);
  }

  return (
    <div className="mx-auto max-w-lg pb-12">
      <div>
        {(() => {
          if (items.length === 0) {
            return (
              <div>
                <EmptyState
                  className="bg-white"
                  captions={{
                    thereAreNo: t("app.linkedAccounts.pending.empty"),
                  }}
                />
              </div>
            );
          } else {
            return (
              <ul className="grid-cols-1 gap-3 sm:grid">
                {items.map((item, idx) => {
                  return (
                    <li key={idx} className="col-span-1 divide-y divide-gray-200 rounded-sm border-t border-gray-300 bg-white shadow-md sm:border">
                      <div className="flex w-full items-center justify-between space-x-6 p-6">
                        <div className="w-full space-y-2">
                          {item.createdByTenantId !== appData.currentTenant?.id && item.createdByUser && (
                            <div className="flex items-center justify-between space-x-3">
                              <p className="mb-2 w-full border-b pb-3 text-sm font-normal text-gray-700">
                                {item.createdByUser.firstName} ({item.createdByUser.email}) {t("app.linkedAccounts.invitation.hasSentYou")}.
                              </p>
                            </div>
                          )}
                          <div className="flex items-center justify-between space-x-3">
                            <h3 className="truncate text-sm font-medium text-gray-900">
                              {whoAmI(item) === 0 ? <span>{item.clientTenant.name}</span> : <span>{item.providerTenant.name}</span>}
                            </h3>
                            {(() => {
                              if (whoAmI(item) !== 0) {
                                return (
                                  <span className="inline-block flex-shrink-0 rounded-sm border-teal-300 bg-teal-100 px-2 py-0.5 text-sm font-medium text-teal-800">
                                    {t("models.provider.object")}
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="inline-block flex-shrink-0 rounded-sm border-purple-300 bg-purple-100 px-2 py-0.5 text-sm font-medium text-purple-800">
                                    {t("models.client.object")}
                                  </span>
                                );
                              }
                            })()}
                          </div>
                          <div className="text-sm text-gray-500 sm:flex sm:items-center sm:justify-between sm:space-x-2">
                            <p className="truncate">{whoAmI(item) === 0 ? <span>{item.clientTenant.name}</span> : <span>{item.providerTenant.name}</span>}</p>
                            {item.createdAt && <p className="truncate text-sm font-light">{dateAgo(item.createdAt)}</p>}
                          </div>
                        </div>
                      </div>
                      <div>
                        {(() => {
                          if (item.status === 0 && item.createdByTenantId !== appData.currentTenant?.id) {
                            return (
                              <div className="-mt-px flex divide-x divide-gray-200">
                                <div className="flex w-0 flex-1">
                                  <button
                                    type="button"
                                    onClick={() => reject(item)}
                                    disabled={loading}
                                    className={clsx(
                                      "hover:text-theme-500 relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium text-gray-700 focus:outline-none",
                                      loading && " cursor-not-allowed opacity-80"
                                    )}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="ml-3">{t("shared.cancel")}</span>
                                  </button>
                                </div>
                                <div className="-ml-px flex w-0 flex-1">
                                  <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => accept(item)}
                                    className={clsx(
                                      "hover:text-theme-500 relative inline-flex w-0 flex-1 items-center justify-center rounded-br-lg border border-transparent py-4 text-sm font-medium text-gray-700 focus:outline-none",
                                      loading && " cursor-not-allowed opacity-80"
                                    )}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>

                                    {(() => {
                                      if (whoAmI(item) === 0) {
                                        return <span className="ml-3">{t("shared.accept")}</span>;
                                      } else {
                                        return <span className="ml-3">{t("shared.accept")}</span>;
                                      }
                                    })()}
                                  </button>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="-mt-px flex divide-x divide-gray-200">
                                <div className="w-full">
                                  {item.status === 0 && (
                                    <div className="relative -mr-px inline-flex w-full flex-1 items-center justify-center rounded-bl-lg border border-transparent bg-gray-100 py-4 text-sm font-medium text-gray-700">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="ml-3">{t("app.linkedAccounts.pending.invitationSent")}</span>
                                    </div>
                                  )}
                                  {(() => {
                                    if (item.status === 2) {
                                      <div className="relative -mr-px inline-flex w-full flex-1 items-center justify-center rounded-bl-lg border border-transparent bg-red-50 py-4 text-sm font-medium text-red-700">
                                        <span className="ml-3">{t("shared.rejected")}</span>
                                      </div>;
                                    } else if (item.status === 1) {
                                      return (
                                        <div className="relative inline-flex w-full flex-1 items-center justify-center rounded-br-lg border border-transparent bg-teal-50 py-4 text-sm font-medium text-teal-700">
                                          <span className="ml-3">{t("shared.accepted")}</span>
                                        </div>
                                      );
                                    } else {
                                      return <div></div>;
                                    }
                                  })()}
                                </div>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </li>
                  );
                })}
              </ul>
            );
          }
        })()}
      </div>
      <ConfirmModal ref={modalAccept} onYes={accepted} />
      <ConfirmModal ref={modalReject} onYes={rejected} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}
