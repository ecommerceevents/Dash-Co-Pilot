import { useTranslation } from "react-i18next";
import { useState } from "react";
import clsx from "~/utils/shared/ClassesUtils";
import { TenantUserInvitation } from "@prisma/client";
import { useSubmit } from "@remix-run/react";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import UserBadge from "../../users/UserBadge";
import { useRootData } from "~/utils/data/useRootData";

interface Props {
  items: TenantUserInvitation[];
  canDelete: boolean;
}
export default function MemberInvitationsListAndTable({ items, canDelete }: Props) {
  const { t } = useTranslation();
  const { appConfiguration } = useRootData();
  const submit = useSubmit();

  const [sortByColumn, setSortByColumn] = useState("");
  const [sortDirection, setSortDirection] = useState(1);
  const headers = [
    // {
    //   name: "role",
    //   title: t("settings.profile.type"),
    // },
    {
      name: "email",
      title: t("account.shared.email"),
    },
    {
      name: "link",
      title: "Invitation link",
    },
  ];

  // function getUserRole(item: TenantUserInvitation) {
  //   return t("settings.profile.types." + TenantUserType[item.type]);
  // }
  // function getUserRoleClass(item: TenantUserInvitation) {
  //   switch (item.type as TenantUserType) {
  //     case TenantUserType.OWNER:
  //       return "bg-slate-50 text-gray-800 border border-slate-300";
  //     case TenantUserType.ADMIN:
  //       return "bg-rose-50 border border-rose-200";
  //     case TenantUserType.MEMBER:
  //       return "bg-blue-50 border border-blue-200";
  //   }
  // }
  function sortBy(column: string | undefined) {
    if (column) {
      setSortDirection(sortDirection === -1 ? 1 : -1);
      setSortByColumn(column);
    }
  }

  function deleteUserInvitation(invitation: TenantUserInvitation) {
    const form = new FormData();
    form.set("action", "delete-invitation");
    form.set("invitation-id", invitation.id);
    submit(form, {
      method: "post",
    });
  }

  function getInvitationLink(invitation: TenantUserInvitation) {
    return appConfiguration.app.url + `/invitation/${invitation.id}`;
  }

  return (
    <div>
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
                            "select-none truncate px-2 py-1 text-left text-xs font-medium tracking-wider text-gray-500",
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
                  {items.map((item, idx) => {
                    return (
                      <tr key={idx}>
                        {/* <td className="whitespace-nowrap px-2 py-1 text-sm text-gray-600">
                          <span
                            className={clsx("inline-flex w-28 items-center justify-center rounded-sm px-1 py-1 text-xs font-medium", getUserRoleClass(item))}
                          >
                            {getUserRole(item)}
                          </span>
                        </td> */}
                        <td className="whitespace-nowrap px-2 py-1 text-sm text-gray-600">
                          <UserBadge
                            item={{
                              id: "",
                              email: item.email,
                              firstName: item.firstName,
                              lastName: item.lastName,
                            }}
                          />
                        </td>
                        <td className="whitespace-nowrap px-2 py-1 text-sm text-gray-600">
                          <a href={getInvitationLink(item)} target="_blank" type="button" rel="noreferrer" className="truncate font-medium italic underline">
                            Open invitation link
                          </a>
                        </td>
                        <td className="w-20 whitespace-nowrap px-2 py-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <ButtonTertiary destructive disabled={!canDelete} type="button" onClick={() => deleteUserInvitation(item)}>
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
      </div>
    </div>
  );
}
