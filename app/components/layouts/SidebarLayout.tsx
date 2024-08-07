import { Transition } from "@headlessui/react";
import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import SidebarMenu from "./SidebarMenu";
import LinkedAccountsButton from "./buttons/LinkedAccountsButton";
import ProfileButton from "./buttons/ProfileButton";
import QuickActionsButton from "./buttons/QuickActionsButton";
import CurrentSubscriptionButton from "./buttons/CurrentSubscriptionButton";
import TenantSelect from "./selectors/TenantSelect";
import { Link, useNavigate, useParams } from "@remix-run/react";
import LogoDark from "~/assets/img/logo-dark.png";
import SearchButton from "./buttons/SearchButton";
import { useTitleData } from "~/utils/data/useTitleData";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import ChatSupportButton from "./buttons/ChatSupportButton";
import { NovuProvider, PopoverNotificationCenter, IMessage, ButtonTypeEnum } from "@novu/notification-center";
import { useRootData } from "~/utils/data/useRootData";
import NotificationsButton from "./buttons/NotificationsButton";
import OnboardingButton from "./buttons/OnboardingButton";
import OnboardingSession from "~/modules/onboarding/components/OnboardingSession";
import { useKBar } from "kbar";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import SaasRockUpdateButton from "./buttons/SaasRockUpdateButton";
import AddFeedbackButton from "./buttons/AddFeedbackButton";
import { SideBarItem } from "~/application/sidebar/SidebarItem";
import clsx from "clsx";
import ThemeSelector from "../ui/selectors/ThemeSelector";

interface Props {
  layout: "app" | "admin" | "docs";
  children: ReactNode;
  menuItems?: SideBarItem[];
  className?: string;
}

export default function SidebarLayout({ layout, children, menuItems, className = "h-screen" }: Props) {
  const { query } = useKBar();

  const rootData = useRootData();
  const appOrAdminData = useAppOrAdminData();
  const { appConfiguration } = useRootData();
  const params = useParams();
  const title = useTitleData() ?? "";

  const mainElement = useRef<HTMLElement>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);

  useEffect(() => {
    try {
      // @ts-ignore
      $crisp?.push(["do", "chat:hide"]);
    } catch (e) {
      // ignore
    }
  }, []);

  function onOpenCommandPalette() {
    query.toggle();
  }

  function getLogoDarkMode() {
    if (appConfiguration.branding.logoDarkMode?.length) {
      return appConfiguration.branding.logoDarkMode;
    }
    if (appConfiguration.branding.logo?.length) {
      return appConfiguration.branding.logo;
    }
    return LogoDark;
  }
  return (
    <NotificationsProvider layout={layout}>
      <OnboardingSession open={onboardingModalOpen} setOpen={setOnboardingModalOpen} />
      {/* <WarningBanner title="Onboarding" text={appOrAdminData?.onboarding?.onboarding.title ?? "No onboarding"} /> */}

      <div
        className={clsx("flex overflow-hidden bg-gray-100 text-gray-800", className)}
        style={{
          colorScheme: "light",
        }}
      >
        {/*Mobile sidebar */}
        <div className="md:hidden">
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 flex">
              <Transition
                as={Fragment}
                show={sidebarOpen}
                enter="transition-opacity ease-linear duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity ease-linear duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0">
                  <div className="absolute inset-0 bg-gray-800 opacity-75" />
                </div>
              </Transition>

              <Transition
                as={Fragment}
                show={sidebarOpen}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <div className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-900">
                  <div className="absolute right-0 top-0 -mr-14 mt-2 p-1">
                    <button
                      className="flex h-12 w-12 items-center justify-center rounded-sm focus:bg-gray-600 focus:outline-none"
                      aria-label="Close sidebar"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                      <svg className="h-7 w-7 text-white" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-5 h-0 flex-1 overflow-y-auto">
                    <nav className="space-y-3 px-2">
                      <div className="flex flex-col space-y-2">
                        <Link to={"/"}>
                          <img
                            className={"mx-auto h-8 w-auto"}
                            src={appConfiguration.branding.logoDarkMode || appConfiguration.branding.logo || LogoDark}
                            alt="Logo"
                          />
                        </Link>
                      </div>
                      <SidebarMenu layout={layout} onSelected={() => setSidebarOpen(!sidebarOpen)} menuItems={menuItems} />
                    </nav>
                  </div>
                  {layout == "app" && <TenantSelect onOpenCommandPalette={onOpenCommandPalette} />}
                </div>
              </Transition>
              <div className="w-14 flex-shrink-0">{/*Dummy element to force sidebar to shrink to fit close icon */}</div>
            </div>
          )}
        </div>

        {/*Desktop sidebar */}
        <div
          className={
            sidebarOpen
              ? "hidden transition duration-1000 ease-in"
              : "border-theme-200 dark:border-theme-800 hidden overflow-x-hidden border-r shadow-sm md:flex md:flex-shrink-0 dark:border-r-0 dark:shadow-lg"
          }
        >
          <div className="flex w-64 flex-col">
            <div className="bg-theme-600 flex h-0 flex-1 flex-col shadow-md">
              <div className="flex flex-1 flex-col overflow-y-auto">
                <nav className="flex-1 select-none space-y-3 bg-gray-900 px-2 py-4">
                  <div className="flex flex-col space-y-2">
                    <Link to={"/"}>
                      <img className={"mx-auto h-8 w-auto"} src={getLogoDarkMode()} alt="Logo" />
                    </Link>
                  </div>
                  <SidebarMenu layout={layout} menuItems={menuItems} />
                </nav>
              </div>
            </div>

            {layout == "app" && <TenantSelect onOpenCommandPalette={onOpenCommandPalette} />}
          </div>
        </div>

        {/*Content */}
        <div className="flex w-0 flex-1 flex-col overflow-hidden">
          <div className="relative flex h-14 flex-shrink-0 border-b border-gray-200 bg-white shadow-inner">
            <button
              className="border-r border-gray-200 px-4 text-gray-600 focus:bg-gray-100 focus:text-gray-600 focus:outline-none"
              aria-label="Open sidebar"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg className="h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>

            <NavBar
              layout={layout}
              title={title}
              buttons={{
                mySubscription: getUserHasPermission(appOrAdminData, "app.settings.subscription.update"),
                linkedAccounts: getUserHasPermission(appOrAdminData, "app.settings.linkedAccounts.view"),
                feedback: rootData.appConfiguration.app.features.tenantFeedback,
                chatSupport: rootData.chatWebsiteId !== null,
                search: true,
                notifications: appConfiguration.notifications.enabled && (layout === "admin" || layout === "app"),
                onboarding: appConfiguration.onboarding.enabled,
                hasUpdate: rootData.version.hasUpdate,
              }}
              onOpenCommandPalette={onOpenCommandPalette}
              onOpenOnboardingModal={() => setOnboardingModalOpen(true)}
            />
          </div>

          <main ref={mainElement} className="flex-1 overflow-y-auto bg-gray-50 focus:outline-none" tabIndex={0}>
            <div key={params.tenant} className="pb-20 sm:pb-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </NotificationsProvider>
  );
}

function NotificationsProvider({ layout, children }: { layout: "app" | "admin" | "docs"; children: ReactNode }) {
  const rootData = useRootData();
  const appOrAdminData = useAppOrAdminData();
  function hasNotifications() {
    if (!appOrAdminData?.user?.id) {
      return false;
    }
    if (layout === "docs") {
      return false;
    }
    return rootData.appConfiguration.notifications.enabled && rootData.appConfiguration.notifications.novuAppId !== undefined;
  }
  return (
    <>
      {hasNotifications() ? (
        <NovuProvider subscriberId={appOrAdminData?.user?.id} applicationIdentifier={rootData.appConfiguration.notifications.novuAppId ?? ""}>
          {children}
        </NovuProvider>
      ) : (
        children
      )}
    </>
  );
}

function NavBar({
  layout,
  title,
  buttons,
  onOpenCommandPalette,
  onOpenOnboardingModal,
}: {
  layout?: string;
  title?: string;
  buttons: {
    mySubscription: boolean;
    linkedAccounts: boolean;
    feedback: boolean;
    chatSupport: boolean;
    search: boolean;
    notifications: boolean;
    onboarding: boolean;
    hasUpdate: boolean;
  };
  onOpenCommandPalette: () => void;
  onOpenOnboardingModal: () => void;
}) {
  const appOrAdminData = useAppOrAdminData();
  const navigate = useNavigate();
  function onNotificationClick(notification: IMessage) {
    if (notification.cta?.data.url) {
      if (notification.cta.data.url.startsWith("http")) {
        if (window !== undefined) {
          window.location.href = notification.cta.data.url;
        }
      } else {
        navigate(notification.cta.data.url);
      }
    }
  }
  function onActionClick(_templateIdentifier: string, _type: ButtonTypeEnum, _message: IMessage) {
    // TODO
  }
  return (
    <div className="flex flex-1 justify-between space-x-2 px-3">
      <div className="flex flex-1 items-center">
        <div className="font-extrabold">{title}</div>
      </div>
      <div className="flex items-center space-x-2 md:ml-6">
        {buttons.onboarding && appOrAdminData?.onboardingSession && (
          <OnboardingButton item={appOrAdminData?.onboardingSession} onClick={onOpenOnboardingModal} />
        )}
        {layout === "app" && buttons.mySubscription && <CurrentSubscriptionButton />}
        {layout === "admin" && buttons.hasUpdate && <SaasRockUpdateButton />}
        {buttons.notifications && appOrAdminData?.user && (
          <PopoverNotificationCenter onNotificationClick={onNotificationClick} onActionClick={onActionClick} colorScheme={"light"}>
            {({ unseenCount }) => <NotificationsButton unseenCount={unseenCount} />}
          </PopoverNotificationCenter>
        )}
        {buttons.search && <SearchButton onClick={onOpenCommandPalette} />}
        {layout === "app" && buttons.feedback && <AddFeedbackButton />}
        {layout === "app" && buttons.linkedAccounts && <LinkedAccountsButton />}
        {layout === "app" && buttons.chatSupport && <ChatSupportButton />}
        {layout === "app" && <QuickActionsButton entities={appOrAdminData?.entities?.filter((f) => f.showInSidebar)} />}
        {(layout === "app" || layout === "admin") && <ThemeSelector variant="secondary" />}
        {(layout === "app" || layout === "admin") && <ProfileButton user={appOrAdminData?.user} layout={layout} />}
      </div>
    </div>
  );
}
