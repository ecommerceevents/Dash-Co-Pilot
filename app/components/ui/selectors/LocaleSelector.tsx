import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useLocation, useMatches, useSearchParams, useSubmit } from "@remix-run/react";
import { useRootData } from "~/utils/data/useRootData";
import AnalyticsHelper from "~/utils/helpers/AnalyticsHelper";
import { i18nConfig } from "~/locale/i18n";
import { Fragment } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { Button } from "../button";

interface Props {
  className?: string;
  disabled?: boolean;
}

export default function LocaleSelector({ className, disabled }: Props) {
  const { t } = useTranslation();
  let location = useLocation();
  const [searchParams] = useSearchParams();
  const submit = useSubmit();
  const rootData = useRootData();
  const matches = useMatches();

  async function select(value: string) {
    const form = new FormData();
    form.set("action", "setLocale");
    searchParams.set("lng", value);
    form.set("redirect", location.pathname + "?" + searchParams.toString());
    form.set("lng", value);
    submit(form, { method: "post", action: "/", preventScrollReset: true });

    const routeMatch = matches.find((m) => m.pathname == location.pathname);
    AnalyticsHelper.addEvent({
      url: location.pathname,
      route: routeMatch?.id,
      rootData,
      action: "setLocale",
      category: "user",
      label: "locale",
      value,
    });
  }

  return (
    <Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <Button variant="ghost" className={clsx("flex w-10 space-x-2", className)}>
            <div
              className={clsx(
                "text-muted-foreground inline-flex flex-shrink-0 items-center rounded-full p-1 text-xs font-medium",
                `theme-${rootData.appConfiguration?.app.theme}`
              )}
            >
              <div className="p-0.5">
                {/* {t(i18n.language)} */}
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
                  />
                </svg>
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>{t("shared.language")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {i18nConfig.supportedLngs.map((language, index) => {
              return (
                <DropdownMenuItem key={index} onClick={() => select(language)}>
                  {t("shared.locales." + language)}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* <Dropdown
        className={className}
        right={right}
        btnClassName={clsx(
          "text-muted-foreground rounded-md px-2 py-1 inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500",
          btnClassName
        )}
        button={
          <div className="p-0.5">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
              />
            </svg>
          </div>
        }
        options={
          <div>
            {i18nConfig.supportedLngs.map((language, index) => {
              return (
                <Menu.Item key={index}>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => select(language)}
                      key={index}
                      className={clsx(
                        "hover:bg-secondary hover:text-secondary-foreground flex w-full space-x-2 text-left",
                        active ? "" : "",
                        "block px-4 py-2 text-sm"
                      )}
                      role="menuitem"
                    >
                      <div>{t("shared.locales." + language)}</div>
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        }
      /> */}
    </Fragment>
  );
}
