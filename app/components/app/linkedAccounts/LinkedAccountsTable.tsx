import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import clsx from "~/utils/shared/ClassesUtils";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import { LinkedAccountWithDetails } from "~/utils/db/linkedAccounts.db.server";
import { useAppData } from "~/utils/data/useAppData";
import { useSubmit } from "@remix-run/react";
import { LinkedAccountStatus } from "~/application/enums/tenants/LinkedAccountStatus";
import { LinkedAccount } from ".prisma/client";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";

interface Props {
  items: LinkedAccountWithDetails[];
  canDelete: boolean;
}

export default function LinkedAccountsTable({ items, canDelete }: Props) {
  const appData = useAppData();
  const { t } = useTranslation();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);
  const modalReject = useRef<RefConfirmModal>(null);
  const modalAccept = useRef<RefConfirmModal>(null);

  const [sortByColumn, setSortByColumn] = useState("type");
  const [sortDirection, setSortDirection] = useState(-1);
  const headers = [
    {
      title: t("models.linkedAccount.type"),
    },
    {
      name: "name",
      title: t("models.tenant.object"),
    },
    {
      title: t("shared.status"),
    },
    {
      title: t("shared.actions"),
    },
  ];

  function sortBy(column: string | undefined) {
    if (column) {
      setSortDirection(sortDirection === -1 ? 1 : -1);
      setSortByColumn(column);
    }
  }
  function getTenant(item: LinkedAccountWithDetails) {
    return item.clientTenantId === appData.currentTenant?.id ? item.providerTenant : item.clientTenant;
  }
  const sortedItems = (): LinkedAccountWithDetails[] => {
    if (!items) {
      return [];
    }
    const column = sortByColumn;
    if (!column || column === "") {
      return items;
    }
    return items.slice().sort((x: any, y: any) => {
      if (x[column] && y[column]) {
        if (sortDirection === -1) {
          return (x[column] > y[column] ? 1 : -1) ?? 1;
        } else {
          return (x[column] < y[column] ? 1 : -1) ?? 1;
        }
      }
      return 1;
    });
  };

  function deleteLinkedAccount(item: LinkedAccount) {
    confirmDelete.current?.setValue(item);
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  function confirmedDelete(value: LinkedAccount) {
    const form = new FormData();
    form.set("action", "delete");
    form.set("linked-account-id", value.id);
    submit(form, {
      method: "post",
    });
  }
  function inviterTenant(item: LinkedAccountWithDetails) {
    if (item.createdByTenantId === item.providerTenantId) {
      return item.providerTenant;
    }
    return item.clientTenant;
  }
  function reject(item: LinkedAccountWithDetails) {
    const whoAmIName = inviterTenant(item).id === appData.currentTenant?.id ? t("models.provider.object") : t("models.client.object");
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
    const whoAmIName = inviterTenant(item).id === appData.currentTenant?.id ? t("models.provider.object") : t("models.client.object");
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
    form.set("action", "update-status");
    form.set("linked-account-id", item.id);
    form.set("accepted", "true");
    submit(form, {
      method: "post",
    });
  }
  function rejected(item: LinkedAccountWithDetails) {
    item.status = 2;
    const form = new FormData();
    form.set("action", "update-status");
    form.set("linked-account-id", item.id);
    form.set("accepted", "false");
    submit(form, {
      method: "post",
    });
  }

  return (
    <div>
      {(() => {
        if (sortedItems().length === 0) {
          return (
            <div>
              <EmptyState
                className="bg-white"
                captions={{
                  thereAreNo: t("app.linkedAccounts.empty"),
                }}
              />
            </div>
          );
        } else {
          return (
            <div className="flex flex-col">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full py-2 align-middle">
                  <div className="overflow-hidden border border-gray-200 shadow sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {headers.map((header, idx) => {
                            return (
                              <th
                                key={idx}
                                onClick={() => sortBy(header.name)}
                                scope="col"
                                className={clsx(
                                  "select-none px-3 py-2 text-left text-xs font-medium tracking-wider text-gray-500",
                                  header.name && "cursor-pointer hover:text-gray-700"
                                )}
                              >
                                <div className="flex items-center space-x-1 text-gray-500">
                                  <div>{header.title}</div>
                                  <div className={clsx((!header.name || sortByColumn !== header.name) && "invisible")}>
                                    {(() => {
                                      if (sortDirection === -1) {
                                        return (
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                              fillRule="evenodd"
                                              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        );
                                      } else {
                                        return (
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                              fillRule="evenodd"
                                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        );
                                      }
                                    })()}
                                  </div>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {sortedItems().map((link, idx) => {
                          return (
                            <tr key={idx}>
                              <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-600">
                                <span className="inline-block flex-shrink-0  rounded-sm border-gray-300 text-sm font-medium text-gray-800">
                                  {inviterTenant(link).id === appData.currentTenant?.id ? t("models.provider.object") : t("models.client.object")}
                                </span>
                              </td>
                              <td className="w-full whitespace-nowrap px-3 py-2 text-sm text-gray-600">
                                <div className="flex items-end">
                                  <div>
                                    <div className="text-sm font-extrabold text-gray-900">{getTenant(link).name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-600">
                                {link.status === LinkedAccountStatus.PENDING ? (
                                  <span className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-sm font-medium text-blue-900">
                                    <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-blue-400" fill="currentColor" viewBox="0 0 8 8">
                                      <circle cx={4} cy={4} r={3} />
                                    </svg>
                                    Pending
                                  </span>
                                ) : link.status === LinkedAccountStatus.REJECTED ? (
                                  <span className="inline-flex items-center rounded-md border border-rose-100 bg-rose-50 px-2.5 py-0.5 text-sm font-medium text-rose-900">
                                    <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-rose-400" fill="currentColor" viewBox="0 0 8 8">
                                      <circle cx={4} cy={4} r={3} />
                                    </svg>
                                    Rejected
                                  </span>
                                ) : link.status === LinkedAccountStatus.LINKED ? (
                                  <span className="inline-flex items-center rounded-md border border-teal-100 bg-teal-50 px-2.5 py-0.5 text-sm font-medium text-teal-900">
                                    <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-teal-400" fill="currentColor" viewBox="0 0 8 8">
                                      <circle cx={4} cy={4} r={3} />
                                    </svg>
                                    Linked
                                  </span>
                                ) : (
                                  <div></div>
                                )}
                              </td>
                              <td className="w-20 whitespace-nowrap px-3 py-2 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  {link.status === LinkedAccountStatus.LINKED ? (
                                    <>
                                      <ButtonTertiary disabled={!canDelete} onClick={() => deleteLinkedAccount(link)}>
                                        <div>{t("shared.delete")}</div>
                                      </ButtonTertiary>
                                    </>
                                  ) : link.status === LinkedAccountStatus.PENDING ? (
                                    <>
                                      {link.createdByTenantId === appData.currentTenant.id ? (
                                        <div>
                                          <ButtonTertiary className="text-gray-600 hover:text-gray-800" onClick={() => deleteLinkedAccount(link)}>
                                            <div>{t("shared.delete")}</div>
                                          </ButtonTertiary>
                                        </div>
                                      ) : (
                                        <>
                                          <ButtonTertiary onClick={() => accept(link)}>
                                            <div>{t("shared.accept")}</div>
                                          </ButtonTertiary>
                                          <ButtonTertiary onClick={() => reject(link)}>
                                            <div>{t("shared.reject")}</div>
                                          </ButtonTertiary>
                                        </>
                                      )}
                                    </>
                                  ) : link.status !== LinkedAccountStatus.PENDING ? (
                                    <ButtonTertiary className="text-gray-600 hover:text-gray-800" onClick={() => deleteLinkedAccount(link)}>
                                      <div>{t("shared.delete")}</div>
                                    </ButtonTertiary>
                                  ) : (
                                    <></>
                                  )}
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
            </div>
          );
        }
      })()}
      <ConfirmModal ref={modalAccept} onYes={accepted} />
      <ConfirmModal ref={modalReject} onYes={rejected} />
      <ConfirmModal ref={confirmDelete} onYes={confirmedDelete} />
    </div>
  );
}
