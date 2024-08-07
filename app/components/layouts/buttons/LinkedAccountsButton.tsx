import { useTranslation } from "react-i18next";
import clsx from "~/utils/shared/ClassesUtils";
import { Link, useParams } from "@remix-run/react";
import { useAppData } from "~/utils/data/useAppData";
import UrlUtils from "~/utils/app/UrlUtils";

export default function LinkedAccountsButton() {
  const params = useParams();
  const { t } = useTranslation();
  const appData = useAppData();

  return (
    <>
      {/*Pending invitations (links) */}
      {appData.currentRole < 3 && appData.pendingInvitations > 0 && (
        <div className="hidden divide-x divide-gray-300 rounded-sm shadow-none sm:inline-flex">
          <div className="relative z-0 inline-flex truncate rounded-full text-sm shadow-none">
            <Link
              to={UrlUtils.currentTenantUrl(params, "settings/linked-accounts")}
              className={clsx(
                "relative inline-flex items-center rounded-full border border-gray-100 bg-gray-50 p-2 font-medium text-gray-500 shadow-inner hover:bg-theme-300 hover:text-theme-800 focus:z-10 focus:bg-theme-400 focus:text-theme-900 focus:outline-none focus:ring-2 focus:ring-theme-100 focus:ring-offset-2 focus:ring-offset-theme-50",
                appData.pendingInvitations > 0 &&
                  "flex space-x-2 border-theme-300 bg-theme-50 px-3 text-theme-900 hover:bg-theme-100 hover:text-theme-800 focus:z-10 focus:bg-theme-200 focus:text-theme-900 focus:outline-none focus:ring-2 focus:ring-theme-100 focus:ring-offset-2 focus:ring-offset-theme-50",
                !appData.pendingInvitations ||
                  (appData.pendingInvitations === 0 &&
                    " border-gray-100 bg-gray-50 text-gray-800 hover:bg-theme-300 hover:text-theme-800 focus:z-10 focus:bg-theme-400 focus:text-theme-900 focus:outline-none focus:ring-2 focus:ring-theme-50 focus:ring-offset-2 focus:ring-offset-theme-50")
              )}
              aria-haspopup="listbox"
              aria-expanded="true"
              aria-labelledby="listbox-label"
            >
              {appData.pendingInvitations > 0 && (
                <div>
                  <span>{appData.pendingInvitations} </span>
                  {(() => {
                    if (appData.pendingInvitations === 1) {
                      return <span className="hidden lowercase lg:inline-block">{t("app.linkedAccounts.pending.one")}</span>;
                    } else {
                      return <span className="hidden lowercase lg:inline-block">{t("app.linkedAccounts.pending.multiple")}</span>;
                    }
                  })()}
                </div>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </Link>
          </div>
        </div>
      )}
      {/*Pending invitations (links): End */}
    </>
  );
}
