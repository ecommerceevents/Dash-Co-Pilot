import { Link, useParams, useSubmit } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import clsx from "~/utils/shared/ClassesUtils";
import { useOuterClick } from "~/utils/shared/KeypressUtils";
import UserUtils from "~/utils/app/UserUtils";
import UrlUtils from "~/utils/app/UrlUtils";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { useRootData } from "~/utils/data/useRootData";

interface Props {
  user: { email: string; firstName: string | null; lastName: string | null; avatar: string | null; admin?: { userId: string } | null } | null | undefined;
  layout?: "/" | "app" | "admin" | "docs";
  items?: { title: string; path: string; hidden?: boolean; onClick?: () => void }[];
}

export default function ProfileButton({ user, layout, items }: Props) {
  const params = useParams();
  const { t } = useTranslation();
  const submit = useSubmit();
  const rootData = useRootData();
  const appOrAdminData = useAppOrAdminData();

  const [opened, setOpened] = useState(false);

  function closeDropdownUser() {
    setOpened(false);
  }
  function signOut() {
    submit(null, { method: "post", action: "/logout" });
  }

  const clickOutside = useOuterClick(() => setOpened(false));

  return (
    <div ref={clickOutside} className="relative">
      <div className="inline-flex divide-x divide-gray-300 rounded-sm shadow-none">
        <button
          onClick={() => setOpened(!opened)}
          className={clsx(
            "bg-background text-muted-foreground hover:bg-secondary border-border relative inline-flex items-center rounded-full border font-medium shadow-inner focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2",
            !user?.avatar && "p-2",
            user?.avatar && "p-1"
          )}
          id="user-menu"
          aria-label="User menu"
          aria-haspopup="true"
        >
          {(() => {
            if (user?.avatar) {
              return <img className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800" src={user.avatar} alt="Avatar" />;
            } else {
              return (
                <span className="inline-block h-5 w-5 overflow-hidden rounded-full">
                  <svg className="h-full w-full" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
              );
            }
          })()}
        </button>
      </div>

      <Transition
        as={Fragment}
        show={opened}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="divide-border border-border absolute right-0 z-40 mt-2 w-64 origin-top-right divide-y overflow-hidden rounded-sm border shadow-lg focus:outline-none">
          <div className="shadow-xs bg-background rounded-sm py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
            <div className="text-muted-foreground group flex items-center truncate px-4 py-2 text-sm transition duration-150 ease-in-out" role="menuitem">
              <div className="flex flex-col space-y-1 truncate">
                <div className="font-medium">{UserUtils.profileName(user)}</div>
                <div className="truncate font-bold">{user?.email}</div>
              </div>
            </div>
            <div className="border-border border-t"></div>

            {layout === "app" ? (
              <>
                <Link
                  className="hover:bg-secondary block px-4 py-2 text-sm transition duration-150 ease-in-out"
                  role="menuitem"
                  onClick={closeDropdownUser}
                  to={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, `settings/profile`)}
                >
                  {t("app.navbar.profile")}
                </Link>

                {getUserHasPermission(appOrAdminData, "app.settings.members.view") && (
                  <Link
                    className="hover:bg-secondary block px-4 py-2 text-sm transition duration-150 ease-in-out"
                    role="menuitem"
                    onClick={closeDropdownUser}
                    to={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, "settings/members")}
                  >
                    {t("app.navbar.members")}
                  </Link>
                )}

                {getUserHasPermission(appOrAdminData, "app.settings.subscription.view") && (
                  <Link
                    className="hover:bg-secondary block px-4 py-2 text-sm transition duration-150 ease-in-out"
                    role="menuitem"
                    onClick={closeDropdownUser}
                    to={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, `settings/subscription`)}
                  >
                    {t("app.navbar.subscription")}
                  </Link>
                )}

                {getUserHasPermission(appOrAdminData, "app.settings.account.view") && (
                  <Link
                    className="hover:bg-secondary block px-4 py-2 text-sm transition duration-150 ease-in-out"
                    role="menuitem"
                    onClick={closeDropdownUser}
                    to={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, "settings/account")}
                  >
                    {t("app.navbar.tenant")}
                  </Link>
                )}

                {/* {getUserHasPermission(appOrAdminData, "app.settings.roles.view") && (
                  <Link
                    className="block px-4 py-2 text-sm transition duration-150 ease-in-out hover:bg-secondary"
                    role="menuitem"
                    onClick={closeDropdownUser}
                    to={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions")}
                  >
                    {t("models.role.plural")}
                  </Link>
                )} */}

                {/* <Link
                  className="block px-4 py-2 text-sm transition duration-150 ease-in-out hover:bg-secondary"
                  role="menuitem"
                  onClick={closeDropdownUser}
                  to={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, "settings/groups")}
                >
                  {t("models.group.plural")}
                </Link> */}

                {rootData.appConfiguration.app.features.linkedAccounts && getUserHasPermission(appOrAdminData, "app.settings.linkedAccounts.view") && (
                  <Link
                    className="hover:bg-secondary block px-4 py-2 text-sm transition duration-150 ease-in-out"
                    role="menuitem"
                    onClick={closeDropdownUser}
                    to={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, `settings/linked-accounts`)}
                  >
                    {t("models.linkedAccount.plural")}
                  </Link>
                )}

                {rootData.appConfiguration.app.features.tenantApiKeys && getUserHasPermission(appOrAdminData, "app.settings.apiKeys.view") && (
                  <Link
                    className="hover:bg-secondary block px-4 py-2 text-sm transition duration-150 ease-in-out"
                    role="menuitem"
                    onClick={closeDropdownUser}
                    to={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, `settings/api`)}
                  >
                    {t("models.apiKey.plural")}
                  </Link>
                )}

                {getUserHasPermission(appOrAdminData, "app.settings.auditTrails.view") && (
                  <Link
                    className="hover:bg-secondary block px-4 py-2 text-sm transition duration-150 ease-in-out"
                    role="menuitem"
                    onClick={closeDropdownUser}
                    to={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, "settings/logs")}
                  >
                    {t("models.log.plural")}
                  </Link>
                )}

                <div className="border-border mt-1 border-t"></div>
              </>
            ) : layout === "admin" ? (
              <Link
                className="hover:bg-secondary block px-4 py-2 text-sm transition duration-150 ease-in-out"
                role="menuitem"
                onClick={closeDropdownUser}
                to={!user ? "" : `/admin/settings/profile`}
              >
                {t("app.navbar.profile")}
              </Link>
            ) : layout === "/" ? (
              <Fragment>
                {user?.admin && (
                  <Link
                    className="hover:bg-secondary block px-4 py-2 text-sm transition duration-150 ease-in-out"
                    role="menuitem"
                    onClick={closeDropdownUser}
                    to="/admin"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  className="hover:bg-secondary block px-4 py-2 text-sm transition duration-150 ease-in-out"
                  role="menuitem"
                  onClick={closeDropdownUser}
                  to={`/settings`}
                >
                  {t("app.navbar.profile")}
                </Link>
                <Link
                  className="hover:bg-secondary block px-4 py-2 text-sm transition duration-150 ease-in-out"
                  role="menuitem"
                  onClick={closeDropdownUser}
                  to={`/settings/subscription`}
                >
                  {t("app.navbar.subscription")}
                </Link>
              </Fragment>
            ) : items ? (
              items.map((item) => (
                <Link
                  key={item.path}
                  className="hover:bg-secondary block px-4 py-2 text-sm transition duration-150 ease-in-out"
                  role="menuitem"
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    }
                    closeDropdownUser();
                  }}
                  to={item.path}
                >
                  {item.title}
                </Link>
              ))
            ) : null}

            {!items && (
              <button
                onClick={signOut}
                className="hover:bg-secondary block w-full px-4 py-2 text-left text-sm transition duration-150 ease-in-out focus:outline-none"
                role="menuitem"
                disabled={!user}
              >
                {t("app.navbar.signOut")}
              </button>
            )}
          </div>
        </div>
      </Transition>
    </div>
  );
}
