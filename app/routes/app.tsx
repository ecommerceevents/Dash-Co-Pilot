import { Combobox } from "@headlessui/react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Link } from "@remix-run/react";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import Logo from "~/components/brand/Logo";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import UserUtils from "~/utils/app/UserUtils";
import { getMyTenants, TenantSimple } from "~/utils/db/tenants.db.server";
import { getUser, UserWithoutPassword } from "~/utils/db/users.db.server";
import { getUserInfo } from "~/utils/session.server";
import { useEffect } from "react";
import { useTypedLoaderData } from "remix-typedjson";
import ColorBackgroundUtils from "~/utils/shared/colors/ColorBackgroundUtils";
import { Colors } from "~/application/enums/shared/Colors";
import ColorTextUtils from "~/utils/shared/colors/ColorTextUtils";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import IconLight from "~/assets/img/icon-light.png";
import IconDark from "~/assets/img/icon-dark.png";

type LoaderData = {
  user: UserWithoutPassword;
  myTenants: TenantSimple[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userInfo = await getUserInfo(request);
  const user = await getUser(userInfo.userId);
  if (!user) {
    throw redirect(`/login`);
  }
  const appConfiguration = await getAppConfiguration({ request });
  if (appConfiguration.app.features.tenantHome === "/") {
    return redirect("/");
  }
  const myTenants = await getMyTenants(userInfo.userId);
  if (myTenants.length === 1) {
    try {
      return redirect("/app/" + encodeURIComponent(myTenants[0].slug) + "/dashboard");
    } catch (e) {
      return redirect("/app/" + myTenants[0].id + "/dashboard");
    }
  }
  if (myTenants.length === 0 && user.admin) {
    return redirect("/admin");
  }

  const data: LoaderData = {
    user,
    myTenants,
  };
  return json(data);
};

export default function AppRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();

  useEffect(() => {
    try {
      // @ts-ignore
      $crisp.push(["do", "chat:hide"]);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div>
      <div className="pt-20">
        <div className="mx-auto max-w-7xl px-4 pt-2 sm:px-6 lg:px-8">
          <div className="flex flex-shrink-0 justify-center">
            <Logo />
          </div>
          <div className="sm:align-center sm:flex sm:flex-col">
            <div className="relative mx-auto w-full max-w-xl overflow-hidden px-2 py-12 sm:py-6">
              <div className="text-center">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("app.tenants.select")}</h1>
                <p className="text-muted-foreground mt-4 text-lg leading-6">
                  {data.myTenants.length === 1 ? (
                    <span>{t("app.tenants.youBelongToOne")}</span>
                  ) : (
                    <span>{t("app.tenants.youBelongToMany", { 0: data.myTenants.length })}</span>
                  )}
                </p>
              </div>
              <div className="mt-12">
                {data.myTenants.length === 0 ? (
                  <EmptyState
                    className="border-border rounded-2xl"
                    captions={{
                      thereAreNo: t("api.errors.noOrganizations"),
                    }}
                  />
                ) : (
                  <Combobox
                    as="div"
                    className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 shadow-sm ring-1 ring-black ring-opacity-5 transition-all dark:border-gray-800"
                    onChange={() => {}}
                    autoFocus
                  >
                    <Combobox.Options static className="max-h-64 scroll-py-3 overflow-y-auto p-3">
                      {data.user.admin && (
                        <AccountItem
                          to="/admin"
                          name="Admin"
                          prefix="AD"
                          icon={
                            <div className=" bg-background border-border min-w-0 rounded-md border">
                              {/* <Icon size="h-10 w-10" fromConfig={false} /> */}
                              <img className={clsx("h-10", "hidden w-auto dark:block")} src={IconDark} alt="Logo" />
                              <img className={clsx("h-10", "w-auto dark:hidden")} src={IconLight} alt="Logo" />
                            </div>
                          }
                        />
                      )}
                      {data.myTenants.map((item) => (
                        <AccountItem
                          key={item.id}
                          to={`/app/${item.slug}/dashboard`}
                          name={item.name}
                          icon={
                            !item.icon ? null : (
                              <div className="rounded-md border border-gray-200">
                                <img src={item.icon} className="h-10 w-10 rounded-lg" alt={item.name} />
                              </div>
                            )
                          }
                          prefix={UserUtils.getTenantPrefix(item)}
                        />
                      ))}
                    </Combobox.Options>
                  </Combobox>
                )}
                <div className="mt-4 flex pb-12">
                  <Link to="/new-account" className="text-primary hover:text-primary/90 w-full text-center text-sm font-medium hover:underline">
                    Create an organization<span aria-hidden="true"> &rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountItem({ to, name, icon, prefix, color }: { to: string; name: string; icon?: React.ReactNode | null; prefix?: string | null; color?: Colors }) {
  return (
    <Combobox.Option value={to}>
      {({ active }) => (
        <>
          <Link
            to={to}
            className={clsx(
              "hover:bg-secondary hover:text-secondary-foreground hover:border-border flex cursor-pointer select-none rounded-xl border border-transparent p-3",
              active && ""
            )}
          >
            {icon ? (
              icon
            ) : (
              <div
                className={clsx(color ? ColorBackgroundUtils.getBg700(color) : "bg-primary", "flex h-10 w-10 flex-none items-center justify-center rounded-lg")}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center">
                  <span className={clsx(color ? ColorTextUtils.getText300(color) : "text-primary-foreground", "text-sm font-medium leading-none")}>
                    {prefix}
                  </span>
                </span>
              </div>
            )}
            <div className="ml-4 flex-auto">
              <p className={clsx("text-sm font-medium", active ? "" : "text-muted-foreground")}>{name}</p>
              <p className={clsx("text-sm", active ? "" : "text-muted-foreground")}>{to}</p>
            </div>
          </Link>
        </>
      )}
    </Combobox.Option>
  );
}
