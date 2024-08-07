import { Link, useLocation, useParams, useSubmit } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { SideBarItem } from "~/application/sidebar/SidebarItem";
import { ReactNode, useEffect, useState } from "react";
import { AdminSidebar } from "~/application/sidebar/AdminSidebar";
import { AppSidebar } from "~/application/sidebar/AppSidebar";
import { SidebarGroup } from "~/application/sidebar/SidebarGroup";
import clsx from "~/utils/shared/ClassesUtils";
import QuickActionsButton from "./buttons/QuickActionsButton";
import ProfileButton from "./buttons/ProfileButton";
import SidebarMenu from "./SidebarMenu";
import LogoLight from "~/assets/img/logo-light.png";
import { useAppData } from "~/utils/data/useAppData";
import UrlUtils from "~/utils/app/UrlUtils";
import { useRootData } from "~/utils/data/useRootData";

interface Props {
  layout: "app" | "admin";
  children: ReactNode;
}

export default function StackedLayout({ layout, children }: Props) {
  const params = useParams();
  const appData = useAppData();
  const rootData = useRootData();
  const { t } = useTranslation();
  const submit = useSubmit();
  const currentRoute = useLocation().pathname;

  const [menu, setMenu] = useState<SideBarItem[]>([]);
  const [menuOpened, setMenuOpened] = useState(false);

  useEffect(() => {
    if (layout === "admin") {
      setMenu(AdminSidebar(t));
    } else {
      setMenu(
        AppSidebar({
          t,
          tenantId: params.tenantId || "",
          entities: appData.entities,
          entityGroups: appData.entityGroups,
          appConfiguration: rootData.appConfiguration,
        })
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function allowCurrentUserType(item: SideBarItem) {
    if (!item.adminOnly) {
      return true;
    }
    return appData.user?.admin !== null;
  }
  function allowCurrentRole(item: SideBarItem) {
    return !item.tenantUserTypes || item.tenantUserTypes.includes(appData.currentRole);
  }
  function signOut() {
    submit(null, { method: "post", action: "/logout" });
  }
  const getMenu = (): SidebarGroup[] => {
    const _menu: SidebarGroup[] = [];
    menu
      .filter((f) => allowCurrentUserType(f) && allowCurrentRole(f))
      .forEach(({ title, items }) => {
        _menu.push({
          title: title.toString(),
          items: items?.filter((f) => allowCurrentUserType(f) && allowCurrentRole(f)) ?? [],
        });
      });
    return _menu.filter((f) => f.items.length > 0);
  };

  return (
    <div>
      <nav className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between space-x-3">
            <div className="flex items-center space-x-2 overflow-x-auto py-1">
              <div className="flex-shrink-0">
                <Link to={UrlUtils.currentTenantUrl(params, "dashboard")}>
                  <img className="h-8 w-auto" src={LogoLight} alt="Logo" />
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {/*Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" */}
                  {getMenu().map((group, index) => {
                    return (
                      <div key={index} className="flex items-baseline space-x-4 py-1">
                        {group.items.map((menuItem, index) => {
                          return (
                            <div key={index}>
                              <Link
                                to={menuItem.path}
                                className={clsx(
                                  "truncate rounded-md px-3 py-2 text-sm font-medium",
                                  currentRoute === menuItem.path ? "bg-theme-700 text-white" : "text-gray-500 hover:bg-gray-700 hover:text-white"
                                )}
                                aria-current="page"
                                onClick={() => setMenuOpened(false)}
                              >
                                {menuItem.title}
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center space-x-2">
              {/* {layout === "admin" && <LayoutSelector className="text-sm" />} */}
              {/* {layout === "admin" && <LocaleSelector className="text-sm" />} */}
              {layout === "app" && <QuickActionsButton entities={appData.entities.filter((f) => f.showInSidebar)} className="text-gray-400" />}
              <ProfileButton user={appData.user} layout={layout} />
              <button
                onClick={() => setMenuOpened(!menuOpened)}
                type="button"
                className="focus:ring-theme-500 focus:ring-offset-theme-800 inline-flex items-center justify-center rounded-md p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/*Heroicon name: outline/menu */}
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {/*Heroicon name: outline/x */}
                <svg className="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/*Mobile menu, show/hide based on menu state. */}
        {menuOpened && (
          <div id="mobile-menu" className="bg-slate-900">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              {/*Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" */}
              <SidebarMenu layout={layout} onSelected={() => setMenuOpened(false)} />
            </div>
            <div className="border-t border-gray-700 pb-3 pt-2">
              <div className="space-y-1 px-2">
                <Link
                  onClick={() => setMenuOpened(!menuOpened)}
                  to={UrlUtils.currentTenantUrl(params, `settings/profile`)}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  {t("settings.profile.profileTitle")}
                </Link>

                <button
                  type="button"
                  onClick={signOut}
                  className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  {t("app.navbar.signOut")}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
      <main>
        <div className="mx-auto">
          {/*Replace with your content */}
          {children}
          {/*/End replace */}
        </div>
      </main>
    </div>
  );
}
