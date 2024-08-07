import { Link, useParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useOuterClick } from "~/utils/shared/KeypressUtils";
import { useAppData } from "~/utils/data/useAppData";
import UrlUtils from "~/utils/app/UrlUtils";
import { EntitySimple } from "~/utils/db/entities/entities.db.server";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { useRootData } from "~/utils/data/useRootData";

interface Props {
  entities: EntitySimple[];
  className?: string;
}

export default function QuickActionsButton({ entities, className }: Props) {
  const { t } = useTranslation();
  const params = useParams();
  const appData = useAppData();
  const rootData = useRootData();

  const [opened, setOpened] = useState(false);

  const clickOutside = useOuterClick(() => setOpened(false));
  return (
    <span className={className} ref={clickOutside}>
      {appData.currentRole < 3 && (
        <div className="relative">
          <div className="inline-flex divide-x divide-gray-300 rounded-sm shadow-none">
            <div className="relative z-0 inline-flex rounded-full text-sm shadow-none">
              <button
                onClick={() => setOpened(!opened)}
                type="button"
                className="relative inline-flex items-center rounded-full border border-gray-100 bg-gray-50 p-2 font-medium text-gray-500 shadow-inner hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2"
                aria-haspopup="listbox"
                aria-expanded="true"
                aria-labelledby="listbox-label"
              >
                <span className="sr-only">{t("shared.new")}</span>
                {/*Heroicon name: solid/chevron-down */}
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
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
            <ul
              className="absolute right-0 z-40 mt-2 w-72 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-sm bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              tabIndex={-1}
              aria-labelledby="listbox-label"
            >
              {rootData.appConfiguration.portals?.enabled && rootData.appConfiguration.portals.forTenants && (
                <>
                  <li className="relative cursor-default select-none text-sm text-gray-900" id="listbox-option-2">
                    <Link
                      to={UrlUtils.currentTenantUrl(params, "portals/new")}
                      onClick={() => setOpened(false)}
                      className="flex w-full flex-col p-4 text-left hover:bg-gray-50 focus:outline-none"
                    >
                      <div className="flex justify-between">
                        <p className="font-semibold">{t("models.portal.actions.new.title")}</p>
                      </div>
                      <p className="mt-2 text-gray-500">{t("models.portal.actions.new.description")}</p>
                    </Link>
                  </li>
                </>
              )}
              {entities.map((entity) => {
                return (
                  <li key={entity.name} className="relative cursor-default select-none text-sm text-gray-900" id="listbox-option-0">
                    <Link
                      to={UrlUtils.currentTenantUrl(params, entity.slug + "/new")}
                      onClick={() => setOpened(false)}
                      className="flex flex-col p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between">
                        <p className="font-semibold">
                          {t("shared.new")} {t(entity.title)}
                        </p>
                      </div>
                      {/* <p className="text-gray-500 mt-2">{t("app.contracts.new.description")}</p> */}
                    </Link>
                  </li>
                );
              })}
              {rootData.appConfiguration.app.features.linkedAccounts && getUserHasPermission(appData, "app.settings.linkedAccounts.create") && (
                <>
                  <li className="relative cursor-default select-none text-sm text-gray-900" id="listbox-option-2">
                    <Link
                      to={UrlUtils.currentTenantUrl(params, "settings/linked-accounts/new")}
                      onClick={() => setOpened(false)}
                      className="flex w-full flex-col p-4 text-left hover:bg-gray-50 focus:outline-none"
                    >
                      <div className="flex justify-between">
                        <p className="font-semibold">{t("app.linkedAccounts.new")}</p>
                      </div>
                      <p className="mt-2 text-gray-500">{t("app.linkedAccounts.newDescription")}</p>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </Transition>
        </div>
      )}
    </span>
  );
}
