import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SideBarItem } from "~/application/sidebar/SidebarItem";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import { AdminSidebar } from "~/application/sidebar/AdminSidebar";
import { AppSidebar } from "~/application/sidebar/AppSidebar";
import SidebarIcon from "~/components/layouts/icons/SidebarIcon";
import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { getTranslations } from "~/locale/i18next.server";
import { useAdminData } from "~/utils/data/useAdminData";
import InputSearch from "~/components/ui/input/InputSearch";
import { useRootData } from "~/utils/data/useRootData";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  return json({
    title: `${t("admin.navigation.title")} | ${process.env.APP_NAME}`,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function AdminNavigationRoute() {
  const { t } = useTranslation();
  const params = useParams();
  const adminData = useAdminData();
  const rootData = useRootData();

  const [items, setItems] = useState<SideBarItem[]>([]);
  const [tenantUserTypes, setTenantUserTypes] = useState<TenantUserType[]>([]);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    setItems([]);
    AdminSidebar(t).forEach((admin) => {
      admin.items?.forEach((item) => {
        setItems((items) => [...items, item]);
      });
    });
    AppSidebar({
      t,
      tenantId: params.tenant || "",
      entities: adminData.entities,
      entityGroups: adminData.entityGroups,
      appConfiguration: rootData.appConfiguration,
    }).forEach((app) => {
      app.items?.forEach((item) => {
        setItems((items) => [...items, item]);
      });
    });
    const roleKeys = Object.keys(TenantUserType).filter((key) => !isNaN(Number(key)));
    setTenantUserTypes(roleKeys.map((f) => Number(f)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tenantUserTypeName(type: TenantUserType) {
    return t("settings.profile.types." + TenantUserType[type]);
  }
  function tenantUserTypeHasAccess(item: SideBarItem, role: TenantUserType): boolean {
    return !item.path.includes("/admin") && allowTenantUserType(item, role);
  }
  function allowTenantUserType(item: SideBarItem, role: TenantUserType) {
    return !item.tenantUserTypes || item.tenantUserTypes.includes(role);
  }

  return (
    <div>
      <div className="w-full border-b border-gray-300 bg-white py-2 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between space-x-2 px-4 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-screen-2xl">
          <h1 className="flex flex-1 items-center truncate font-bold">{t("admin.navigation.title")}</h1>
        </div>
      </div>
      <div className="mx-auto max-w-5xl space-y-2 px-4 pt-2 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-screen-2xl">
        <div className="space-y-2">
          <InputSearch value={searchInput} setValue={setSearchInput} />
          <div>
            <div>
              <div className="flex flex-col">
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full py-2 align-middle">
                    <div className="overflow-hidden border border-gray-200 shadow sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="select-none truncate border border-gray-200 px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500"
                            >
                              {t("admin.navigation.icon")}
                            </th>
                            <th
                              scope="col"
                              className="select-none truncate border border-gray-200 px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500"
                            >
                              {t("admin.navigation.menu")}
                            </th>
                            <th
                              scope="col"
                              className="select-none truncate border border-gray-200 px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500"
                            >
                              {t("admin.navigation.url")}
                            </th>
                            <th className="select-none truncate border border-gray-200 px-4 py-2 text-left text-xs font-bold tracking-wider text-gray-500">
                              {t("admin.navigation.sysadmin")}
                            </th>
                            {tenantUserTypes.map((role, idx) => {
                              return (
                                <th
                                  key={idx}
                                  scope="col"
                                  className="select-none truncate border border-gray-200 px-4 py-2 text-left text-xs font-bold tracking-wider text-gray-500"
                                >
                                  <div className="flex items-center justify-center space-x-1 text-gray-500">{tenantUserTypeName(role)}</div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {items.map((item, idx) => {
                            return (
                              <tr key={idx}>
                                <td className="border-border w-10 whitespace-nowrap border-b border-l border-t px-4 py-2 text-sm">
                                  {item.icon && <SidebarIcon className="mx-auto h-5 w-5 text-slate-700" item={item} />}
                                </td>
                                <td className="border-border whitespace-nowrap border-b border-l border-t px-4 py-2 text-sm">{t(item.title)}</td>
                                <td className="border-border whitespace-nowrap border-b border-l border-t px-4 py-2 text-sm">
                                  <a target="_blank" rel="noreferrer" href={item.path} className="text-blue-500 underline hover:text-blue-700">
                                    {item.path}
                                  </a>
                                </td>
                                <td className="whitespace-nowrap border border-gray-200 px-4 text-center text-sm text-gray-600">
                                  <div className="flex justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                </td>

                                {tenantUserTypes.map((role) => {
                                  return (
                                    <td className="whitespace-nowrap border border-gray-200 px-4 text-center text-sm text-gray-600" key={role}>
                                      <div className="flex justify-center">
                                        {(() => {
                                          if (tenantUserTypeHasAccess(item, role)) {
                                            return (
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path
                                                  fillRule="evenodd"
                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                  clipRule="evenodd"
                                                />
                                              </svg>
                                            );
                                          } else {
                                            return (
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
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
                                  );
                                })}
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
          </div>
        </div>
      </div>
    </div>
  );
}
