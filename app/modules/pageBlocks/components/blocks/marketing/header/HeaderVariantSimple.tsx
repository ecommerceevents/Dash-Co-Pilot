import { Fragment, useState } from "react";
import { Transition } from "@headlessui/react";
import { useLocation } from "@remix-run/react";
import Logo from "~/components/brand/Logo";
import DarkModeToggle from "~/components/ui/toggles/DarkModeToggle";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useRootData } from "~/utils/data/useRootData";
import { HeaderBlockDto } from "~/modules/pageBlocks/components/blocks/marketing/header/HeaderBlockUtils";
import HeaderFlyoutItem from "~/components/ui/headers/HeaderFlyoutItem";
import Icon from "~/components/brand/Icon";
import LocaleSelector from "~/components/ui/selectors/LocaleSelector";
import ButtonEvent from "~/components/ui/buttons/ButtonEvent";
import ProfileButton from "~/components/layouts/buttons/ProfileButton";
import ThemeSelector from "~/components/ui/selectors/ThemeSelector";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";

export default function HeaderVariantSimple({ item, width = "7xl" }: { item: HeaderBlockDto; width?: "screen-2xl" | "7xl" }) {
  const { authenticated, appConfiguration, user } = useRootData();
  const { t } = useTranslation();

  const hasProfileButton = appConfiguration?.app.features.tenantHome === "/";

  const location = useLocation();

  const [open, setOpen] = useState(false);
  function isCurrent(path: string): boolean {
    return location.pathname === path;
  }

  const loginOrEnterRoute = () => {
    if (!authenticated) {
      return "/login";
    }
    return "/app";
  };

  function registerRoute() {
    if (appConfiguration?.subscription.allowSignUpBeforeSubscribe) {
      return "/register";
    } else {
      return "/pricing";
    }
  }

  return (
    <div>
      <div className="pb-6">
        <div className="relative pt-6 ">
          <div className={clsx("mx-auto px-4 sm:px-6", width === "screen-2xl" ? "max-w-screen-2xl" : "max-w-7xl")}>
            <nav className="relative flex items-center justify-between sm:h-10 md:justify-center" aria-label="Global">
              <div className="flex flex-1 items-center md:absolute md:inset-y-0 md:left-0">
                <div className="flex w-full items-center justify-between md:w-auto">
                  {item.withLogo ? (
                    <>
                      <Logo className="hidden lg:block" size="h-9" />
                      <Icon className="lg:hidden" size="h-9" />
                    </>
                  ) : (
                    <div></div>
                  )}
                  <div className="-mr-1 flex items-center space-x-2 md:hidden">
                    <div className="flex">
                      {item.withSignInAndSignUp && (
                        <div className="inline-flex space-x-2 rounded-md">
                          {!authenticated && (
                            <ButtonTertiary
                              to={registerRoute()}
                              event={{ action: "click", category: "header", label: t("account.shared.signUp"), value: registerRoute() }}
                            >
                              <div>{t("account.shared.signUp")}</div>
                            </ButtonTertiary>
                          )}
                          {(!hasProfileButton || !authenticated) && (
                            <ButtonPrimary
                              to={loginOrEnterRoute()}
                              event={{
                                action: "click",
                                category: "header",
                                label: !authenticated ? t("account.shared.signIn") : t("shared.enter"),
                                value: loginOrEnterRoute(),
                              }}
                            >
                              {!authenticated ? <div>{t("account.shared.signIn")}</div> : <div>{t("shared.enter")}</div>}
                            </ButtonPrimary>
                          )}
                        </div>
                      )}
                    </div>
                    {item.links.length > 0 && (
                      <button
                        onClick={() => setOpen(!open)}
                        type="button"
                        className=" text-muted-foreground hover:bg-secondary hover:text-secondary-foreground inline-flex items-center justify-center rounded-md p-2 focus:outline-none"
                        id="main-menu"
                        aria-haspopup="true"
                      >
                        <span className="sr-only">{t("shared.close")}</span>
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                    )}
                    {hasProfileButton && authenticated && <ProfileButton user={user} layout={"/"} />}
                  </div>
                </div>
              </div>
              <div className="hidden items-center space-x-2 sm:space-x-4 md:flex md:space-x-6">
                {item.links.map((link, idx) => {
                  return (
                    <Fragment key={idx}>
                      {!link.items || link.items.length === 0 ? (
                        <ButtonEvent
                          to={link.path ?? ""}
                          target={link.target}
                          className={clsx(
                            link.className,
                            "truncate rounded-sm px-3 py-1 text-base font-medium leading-6 transition duration-150 ease-in-out focus:outline-none",
                            !isCurrent(link.path ?? "") && "text-muted-foreground",
                            isCurrent(link.path ?? "") && ""
                          )}
                          event={{ action: "click", category: "header", label: t(link.title), value: link.path ?? "" }}
                        >
                          {t(link.title)} {link.hint && <span className="text-muted-foreground text-xs">{t(link.hint)}</span>}
                        </ButtonEvent>
                      ) : (
                        <HeaderFlyoutItem
                          className="rounded-sm px-3 py-1 text-base font-medium leading-6 transition duration-150 ease-in-out focus:outline-none"
                          title={t(link.title)}
                          items={link.items}
                        />
                      )}
                    </Fragment>
                  );
                })}
                {item.withLanguageSelector && <LocaleSelector className="hidden lg:flex" />}
                {item.withDarkModeToggle && <DarkModeToggle className="hidden lg:flex" />}
                {item.withThemeSelector && <ThemeSelector className="hidden lg:flex" />}
              </div>
              <div className="hidden md:absolute md:inset-y-0 md:right-0 md:flex md:items-center md:justify-end">
                <span className="inline-flex space-x-2">
                  {hasProfileButton && authenticated ? (
                    <ProfileButton user={user} layout={"/"} />
                  ) : (
                    item.withSignInAndSignUp && (
                      <>
                        {!authenticated && (
                          <ButtonTertiary
                            to={registerRoute()}
                            // className="inline-flex items-center rounded-sm border border-transparent px-4 py-2 text-base font-medium text-slate-500 dark:text-white"
                            event={{ action: "click", category: "header", label: t("account.shared.signUp"), value: registerRoute() }}
                          >
                            {t("account.shared.signUp")}
                          </ButtonTertiary>
                        )}
                        <ButtonPrimary
                          to={loginOrEnterRoute()}
                          event={{
                            action: "click",
                            category: "header",
                            label: !authenticated ? t("account.shared.signIn") : t("shared.enter"),
                            value: loginOrEnterRoute(),
                          }}
                        >
                          {!authenticated ? <div>{t("account.shared.signIn")}</div> : <div>{t("shared.enter")}</div>}
                        </ButtonPrimary>
                      </>
                    )
                  )}
                </span>
              </div>
            </nav>
          </div>

          {/* Mobile menu */}
          <Transition
            show={open}
            as={Fragment}
            enter="duration-150 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="duration-100 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="absolute inset-x-0 top-0 z-40 origin-top-right transform p-2 transition md:hidden">
              <div className="bg-background border-border overflow-visible rounded-lg border shadow-xl">
                <div className="flex items-center justify-between px-5 pt-4">
                  <div>{item.withLogo && <Icon />}</div>
                  <div className="-mr-2">
                    <button
                      onClick={() => setOpen(!open)}
                      type="button"
                      className="hover:bg-secondary hover:text-secondary-foreground inline-flex items-center justify-center rounded-md p-2 focus:outline-none"
                    >
                      <span className="sr-only">{t("shared.close")}</span>
                      {/* Heroicon name: x */}
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div role="menu" aria-orientation="vertical" aria-labelledby="main-menu">
                  <div className="px-2 pt-2" role="none">
                    {item.links.map((link, idx) => {
                      return (
                        <Fragment key={idx}>
                          {link.path ? (
                            <ButtonEvent
                              to={link.path}
                              target={link.target}
                              role="menuitem"
                              className={clsx(
                                "hover:bg-secondary hover:text-secondary-foreground block rounded-md px-3 py-2 text-base font-medium",
                                isCurrent(link.path ?? "") ? " bg-secondary " : ""
                              )}
                              event={{
                                action: "click",
                                category: "header",
                                label: t(link.title),
                                value: link.path,
                              }}
                            >
                              {t(link.title)}
                            </ButtonEvent>
                          ) : (
                            <>
                              {link.items?.map((subItem) => {
                                return (
                                  <ButtonEvent
                                    key={subItem.title}
                                    to={subItem.path ?? ""}
                                    role="menuitem"
                                    className={clsx(
                                      "hover:bg-secondary hover:text-secondary-foreground block rounded-md px-3 py-2 text-base font-medium",
                                      isCurrent(subItem.path ?? "") ? " bg-secondary " : ""
                                    )}
                                    event={{
                                      action: "click",
                                      category: "header",
                                      label: t(subItem.title),
                                      value: subItem.path ?? "",
                                    }}
                                  >
                                    {t(subItem.title)}
                                  </ButtonEvent>
                                );
                              })}
                            </>
                          )}
                        </Fragment>
                      );
                    })}
                  </div>
                  <div role="none" className="flex items-center px-2 pb-2">
                    {item.withSignInAndSignUp && !authenticated && (
                      <>
                        <ButtonEvent
                          to={registerRoute()}
                          className={clsx("hover:bg-secondary block w-full rounded-md px-3 py-2 text-center text-base font-medium")}
                          role="menuitem"
                          event={{ action: "click", category: "header", label: t("account.shared.signUp"), value: registerRoute() }}
                        >
                          <div>{t("account.shared.signUp")}</div>
                        </ButtonEvent>

                        <ButtonEvent
                          to="/login"
                          className={clsx("hover:bg-secondary block w-full rounded-md px-3 py-2 text-center text-base font-medium")}
                          role="menuitem"
                          event={{ action: "click", category: "header", label: t("account.shared.signIn"), value: "/login" }}
                        >
                          <div>{t("account.shared.signIn")}</div>
                        </ButtonEvent>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  );
}
