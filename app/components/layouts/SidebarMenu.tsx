import { Link, useLocation, useParams } from "@remix-run/react";
import { Fragment, useState } from "react";
import { SideBarItem } from "~/application/sidebar/SidebarItem";
import { AdminSidebar } from "~/application/sidebar/AdminSidebar";
import { AppSidebar } from "~/application/sidebar/AppSidebar";
import { SidebarGroup } from "~/application/sidebar/SidebarGroup";
import clsx from "~/utils/shared/ClassesUtils";
import SidebarIcon from "./icons/SidebarIcon";
import { useTranslation } from "react-i18next";
import { useAppData } from "~/utils/data/useAppData";
import UrlUtils from "~/utils/app/UrlUtils";
import { DocsSidebar } from "~/application/sidebar/DocsSidebar";
import { useRootData } from "~/utils/data/useRootData";
import { useAdminData } from "~/utils/data/useAdminData";
import TenantSelector from "./selectors/TenantSelector";

interface Props {
  layout: "app" | "admin" | "docs";
  onSelected?: () => void;
  menuItems?: SideBarItem[];
}

export default function SidebarMenu({ layout, onSelected, menuItems }: Props) {
  const params = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  const appData = useAppData();
  const adminData = useAdminData();
  const rootData = useRootData();

  const getMenuItems = () => {
    if (menuItems) {
      return menuItems;
    }
    let menu: SideBarItem[] = [];
    if (menuItems) {
      menu = menuItems;
    } else if (layout === "admin") {
      menu = AdminSidebar(t);
    } else if (layout === "app") {
      menu = AppSidebar({
        t,
        tenantId: params.tenant ?? "",
        entities: appData?.entities ?? [],
        entityGroups: appData?.entityGroups ?? [],
        appConfiguration: rootData.appConfiguration,
      });
    } else if (layout === "docs") {
      menu = DocsSidebar();
    }

    function clearItemsIfNotCollapsible(items: SideBarItem[]) {
      items.forEach((item) => {
        if (item.isCollapsible !== undefined && !item.isCollapsible) {
          item.items = [];
        }
        if (item.items) {
          clearItemsIfNotCollapsible(item.items);
        }
      });
    }
    clearItemsIfNotCollapsible(menu);

    menu.forEach((item) => {
      if (item.isCollapsible !== undefined && !item.isCollapsible) {
        item.items = [];
      }
      item.items?.forEach((subitem) => {
        if (subitem.isCollapsible !== undefined && !subitem.isCollapsible) {
          subitem.items = [];
        }
      });
    });
    // setMenu(layout === "admin" ? AdminSidebar : );
    menu.forEach((group) => {
      group.items?.forEach((element) => {
        if (element.open || isCurrent(element) || currentIsChild(element)) {
          // expanded.push(element.path);
        } else {
          // setExpanded(expanded.filter((f) => f !== element.path));
        }
      });
    });

    return menu;
  };

  const [expanded, setExpanded] = useState<string[]>([]);

  function menuItemIsExpanded(path: string) {
    return expanded.includes(path);
  }
  function toggleMenuItem(path: string) {
    if (expanded.includes(path)) {
      setExpanded(expanded.filter((item) => item !== path));
    } else {
      setExpanded([...expanded, path]);
    }
  }
  function getPath(item: SideBarItem) {
    return UrlUtils.replaceVariables(params, item.path) ?? "";
  }
  function isCurrent(menuItem: SideBarItem) {
    if (menuItem.path) {
      if (menuItem.exact) {
        return location.pathname === getPath(menuItem);
      }
      return location.pathname?.includes(getPath(menuItem));
    }
  }
  function currentIsChild(menuItem: SideBarItem) {
    let hasOpenChild = false;
    menuItem.items?.forEach((item) => {
      if (isCurrent(item)) {
        hasOpenChild = true;
      }
    });
    return hasOpenChild;
  }
  function allowCurrentUserType(item: SideBarItem) {
    if (!item.adminOnly) {
      return true;
    }
    return appData?.user?.admin !== null;
  }
  function allowCurrentTenantUserType(item: SideBarItem) {
    return !item.tenantUserTypes || item.tenantUserTypes.includes(appData?.currentRole);
  }
  function checkUserRolePermissions(item: SideBarItem) {
    return !item.permission || appData?.permissions?.includes(item.permission) || adminData?.permissions?.includes(item.permission);
  }
  function checkFeatureFlags(item: SideBarItem) {
    return !item.featureFlag || rootData.featureFlags?.includes(item.featureFlag);
  }
  const getMenu = (): SidebarGroup[] => {
    function filterItem(f: SideBarItem) {
      return allowCurrentUserType(f) && allowCurrentTenantUserType(f) && checkUserRolePermissions(f) && checkFeatureFlags(f);
    }
    const _menu: SidebarGroup[] = [];
    getMenuItems()
      .filter((f) => filterItem(f))
      .forEach(({ title, items }) => {
        _menu.push({
          title: title.toString(),
          items:
            items
              ?.filter((f) => filterItem(f))
              .map((f) => {
                return {
                  ...f,
                  items: f.items?.filter((f) => filterItem(f)),
                };
              }) ?? [],
        });
      });
    return _menu.filter((f) => f.items.length > 0);
  };

  function cssStates() {
    return {
      selected: clsx(
        ["zinc", "slate", "stone", "gray", "neutral"].includes(rootData.theme)
          ? "bg-slate-700 text-slate-50"
          : "bg-primary/90 focus:bg-primary/80 text-primary-foreground"
      ),
    };
  }
  return (
    <div>
      {layout === "app" && <div>{appData?.currentTenant && <TenantSelector key={params.tenant} />}</div>}

      {/* Mobile */}
      <div className="space-y-1 divide-y-2 divide-slate-800 sm:hidden">
        {getMenu().map((group, index) => {
          return (
            <div key={index} className="mt-2">
              <div id={group.title} className="mt-2">
                <h3 className="px-1 text-xs font-semibold uppercase leading-4 tracking-wider text-slate-500">{t(group.title)}</h3>
              </div>
              {group.items.map((menuItem, index) => {
                return (
                  <div key={index}>
                    {(() => {
                      if (!menuItem.items || menuItem.items.length === 0) {
                        return (
                          <div>
                            {menuItem.path.includes("://") ? (
                              <a
                                target="_blank"
                                href={menuItem.path}
                                rel="noreferrer"
                                className={clsx(
                                  "group mt-1 flex items-center space-x-4 rounded-sm px-4 py-2 text-base leading-5 transition duration-150 ease-in-out hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-gray-50 focus:outline-none"
                                )}
                                onClick={onSelected}
                              >
                                {(menuItem.icon !== undefined || menuItem.entityIcon !== undefined) && <SidebarIcon className="h-5 w-5 " item={menuItem} />}
                                <div>{t(menuItem.title)}</div>
                              </a>
                            ) : (
                              <Link
                                prefetch="intent"
                                id={UrlUtils.slugify(getPath(menuItem))}
                                to={menuItem.redirectTo ?? getPath(menuItem)}
                                className={clsx(
                                  "group mt-1 flex items-center space-x-4 rounded-sm px-4 py-2 text-base leading-5 transition duration-150 ease-in-out  focus:outline-none",
                                  isCurrent(menuItem) && cssStates().selected,
                                  !isCurrent(menuItem) && "text-slate-200 hover:bg-slate-800 focus:bg-slate-800"
                                )}
                                onClick={onSelected}
                              >
                                {(menuItem.icon !== undefined || menuItem.entityIcon !== undefined) && <SidebarIcon className="h-5 w-5 " item={menuItem} />}
                                <div>{t(menuItem.title)}</div>
                              </Link>
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            <div
                              className="group mt-1 flex items-center justify-between rounded-sm px-4 py-2 text-base leading-5 text-slate-200 transition duration-150 ease-in-out hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-gray-50 focus:outline-none"
                              onClick={() => toggleMenuItem(menuItem.path)}
                            >
                              <div className="flex items-center space-x-4 truncate">
                                {(menuItem.icon !== undefined || menuItem.entityIcon !== undefined) && (
                                  <span className="h-5 w-5 text-slate-200 transition ease-in-out">
                                    <SidebarIcon className="h-5 w-5 " item={menuItem} />
                                  </span>
                                )}
                                <div className="truncate">{t(menuItem.title)}</div>
                              </div>
                              {/*Expanded: "text-gray-400 rotate-90", Collapsed: "text-slate-200" */}
                              <svg
                                className={clsx(
                                  "ml-auto h-5 w-5 flex-shrink-0 transform transition-colors duration-150 ease-in-out",
                                  menuItemIsExpanded(menuItem.path)
                                    ? "ml-auto h-3 w-3 rotate-90 transform transition-colors duration-150 ease-in-out group-hover:text-gray-400 group-focus:text-gray-400"
                                    : "ml-auto h-3 w-3 transform transition-colors duration-150 ease-in-out group-hover:text-gray-400 group-focus:text-gray-400"
                                )}
                                viewBox="0 0 20 20"
                              >
                                <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                              </svg>
                            </div>
                            {/*Expandable link section, show/hide based on state. */}
                            {menuItemIsExpanded(menuItem.path) && (
                              <div className="mt-1">
                                {menuItem.items.map((subItem, index) => {
                                  return (
                                    <Fragment key={index}>
                                      {menuItem.path.includes("://") ? (
                                        <a
                                          target="_blank"
                                          href={menuItem.path}
                                          rel="noreferrer"
                                          className={clsx(
                                            "group mt-1 flex items-center rounded-sm py-2 pl-14 leading-5 text-slate-200 transition duration-150 ease-in-out hover:bg-slate-800 hover:text-slate-300 focus:bg-slate-800 focus:text-slate-300 focus:outline-none sm:text-sm"
                                          )}
                                          onClick={onSelected}
                                        >
                                          {(subItem.icon !== undefined || subItem.entityIcon !== undefined) && (
                                            <span className="mr-1 h-5 w-5 transition ease-in-out">
                                              <SidebarIcon className="h-5 w-5 " item={subItem} />
                                            </span>
                                          )}
                                          {t(subItem.title)}
                                        </a>
                                      ) : (
                                        <Link
                                          prefetch="intent"
                                          key={index}
                                          id={UrlUtils.slugify(getPath(subItem))}
                                          to={subItem.redirectTo ?? getPath(subItem)}
                                          className={clsx(
                                            "group mt-1 flex items-center rounded-sm py-2 pl-14 leading-5 transition duration-150 ease-in-out hover:text-slate-300 focus:text-slate-300 focus:outline-none sm:text-sm",
                                            isCurrent(subItem) && cssStates().selected,
                                            !isCurrent(subItem) && "text-slate-200 hover:bg-slate-800 focus:bg-slate-800"
                                          )}
                                          onClick={onSelected}
                                        >
                                          {(subItem.icon !== undefined || subItem.entityIcon !== undefined) && (
                                            <span className="mr-1 h-5 w-5 transition ease-in-out">
                                              <SidebarIcon className="h-5 w-5 " item={subItem} />
                                            </span>
                                          )}
                                          {t(subItem.title)}
                                        </Link>
                                      )}{" "}
                                    </Fragment>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }
                    })()}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Desktop */}
      <div className="hidden space-y-1 divide-y-2 divide-slate-800 sm:block">
        {getMenu().map((group, index) => {
          return (
            <div key={index} className="select-none">
              <div className="mt-2">
                <h3 id="Group-headline" className="px-1 text-xs font-semibold uppercase leading-4 tracking-wider text-slate-500">
                  {t(group.title)}
                </h3>
              </div>
              {group.items.map((menuItem, index) => {
                return (
                  <div key={index}>
                    {(() => {
                      if (!menuItem.items || menuItem.items.length === 0) {
                        return (
                          <div>
                            {menuItem.path.includes("://") ? (
                              <a
                                target="_blank"
                                href={menuItem.path}
                                rel="noreferrer"
                                className={clsx(
                                  "group mt-1 flex items-center justify-between truncate rounded-sm px-4 py-2 text-sm leading-5 text-slate-200 transition duration-150 ease-in-out hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-gray-50 focus:outline-none",
                                  menuItem.icon !== undefined && "px-4"
                                )}
                                onClick={onSelected}
                              >
                                <div className="flex items-center space-x-5">
                                  {(menuItem.icon !== undefined || menuItem.entityIcon !== undefined) && <SidebarIcon className="h-5 w-5 " item={menuItem} />}
                                  <div>{t(menuItem.title)}</div>
                                </div>
                                {menuItem.side}
                              </a>
                            ) : (
                              <Link
                                prefetch="intent"
                                id={UrlUtils.slugify(getPath(menuItem))}
                                to={menuItem.redirectTo ?? getPath(menuItem)}
                                className={clsx(
                                  "group mt-1 flex items-center justify-between truncate rounded-sm px-4 py-2 text-sm leading-5 transition duration-150 ease-in-out  focus:outline-none",
                                  menuItem.icon !== undefined && "px-4",
                                  isCurrent(menuItem) && cssStates().selected,
                                  !isCurrent(menuItem) && "text-slate-200 hover:bg-slate-800 focus:bg-slate-800"
                                )}
                                onClick={onSelected}
                              >
                                <div className="flex items-center space-x-5">
                                  {(menuItem.icon !== undefined || menuItem.entityIcon !== undefined) && <SidebarIcon className="h-5 w-5 " item={menuItem} />}
                                  <div>{t(menuItem.title)}</div>
                                </div>
                                {menuItem.side}
                              </Link>
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            <button
                              type="button"
                              className="group mt-1 flex w-full items-center justify-between truncate rounded-sm px-4 py-2 text-sm leading-5 text-slate-200 transition duration-150 ease-in-out hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-gray-50 focus:outline-none"
                              onClick={() => toggleMenuItem(menuItem.path)}
                            >
                              <div className="flex items-center space-x-5 truncate">
                                {(menuItem.icon !== undefined || menuItem.entityIcon !== undefined) && <SidebarIcon className="h-5 w-5 " item={menuItem} />}
                                <div className="truncate">{t(menuItem.title)}</div>
                              </div>
                              {/*Expanded: "text-gray-400 rotate-90", Collapsed: "text-slate-200" */}

                              {menuItem.side ?? (
                                <svg
                                  className={clsx(
                                    "ml-auto h-5 w-5 flex-shrink-0 transform bg-slate-900 transition-colors duration-150 ease-in-out",
                                    menuItemIsExpanded(menuItem.path)
                                      ? "ml-auto h-3 w-3 rotate-90 transform  transition-colors duration-150 ease-in-out"
                                      : "ml-auto h-3 w-3 transform  transition-colors duration-150 ease-in-out"
                                  )}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                                </svg>
                              )}
                            </button>

                            {/*Expandable link section, show/hide based on state. */}
                            {menuItemIsExpanded(menuItem.path) && (
                              <div className="mt-1">
                                {menuItem.items.map((subItem, index) => {
                                  return (
                                    <Fragment key={index}>
                                      {menuItem.path.includes("://") ? (
                                        <a
                                          target="_blank"
                                          href={menuItem.path}
                                          rel="noreferrer"
                                          className={clsx(
                                            isCurrent(subItem) && cssStates().selected,
                                            "group mt-1 flex items-center rounded-sm py-2 text-sm leading-5 transition duration-150 ease-in-out  focus:outline-none ",
                                            menuItem.icon === undefined && "pl-10",
                                            menuItem.icon !== undefined && "pl-14"
                                          )}
                                          onClick={onSelected}
                                        >
                                          {(subItem.icon !== undefined || subItem.entityIcon !== undefined) && (
                                            <SidebarIcon className="h-5 w-5 " item={subItem} />
                                          )}
                                          <div>{t(subItem.title)}</div>
                                        </a>
                                      ) : (
                                        <Link
                                          prefetch="intent"
                                          id={UrlUtils.slugify(getPath(subItem))}
                                          to={subItem.redirectTo ?? getPath(subItem)}
                                          className={clsx(
                                            "group mt-1 flex items-center rounded-sm py-2 text-sm leading-5 transition duration-150 ease-in-out  focus:outline-none",
                                            menuItem.icon === undefined && "pl-10",
                                            menuItem.icon !== undefined && "pl-14",
                                            isCurrent(subItem) && cssStates().selected,
                                            !isCurrent(subItem) && "hover:bg-slate-800 focus:bg-slate-800"
                                          )}
                                          onClick={onSelected}
                                        >
                                          {(subItem.icon !== undefined || subItem.entityIcon !== undefined) && (
                                            <SidebarIcon className="h-5 w-5 " item={subItem} />
                                          )}
                                          <div>{t(subItem.title)}</div>
                                        </Link>
                                      )}
                                    </Fragment>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }
                    })()}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
