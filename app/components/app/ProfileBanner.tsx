import { useTranslation } from "react-i18next";
import { Link, useParams } from "@remix-run/react";
import UserUtils from "~/utils/app/UserUtils";
import { UserWithoutPassword } from "~/utils/db/users.db.server";
import UrlUtils from "~/utils/app/UrlUtils";

interface Props {
  user: UserWithoutPassword;
}

export default function ProfileBanner({ user }: Props) {
  const { t } = useTranslation();
  const params = useParams();
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-8">
      <div className="py-2 md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          {/*Profile */}
          <div className="flex items-center">
            <Link to={UrlUtils.currentTenantUrl(params, `settings/profile`)}>
              {user?.avatar && <img className="hidden h-12 w-12 rounded-full sm:block" src={user?.avatar} alt="Profile" />}
            </Link>
            <div>
              <div className="flex items-center">
                <div>
                  {(() => {
                    if (user?.avatar) {
                      return <img className="h-12 w-12 rounded-sm sm:hidden" src={user?.avatar} alt="Avatar" />;
                    } else {
                      return (
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-slate-800 shadow-xl sm:hidden">
                          <span className="text-sm font-medium leading-none text-white">{UserUtils.avatarText(user)}</span>
                        </span>
                      );
                    }
                  })()}
                </div>
                <h1 className="ml-3 text-lg font-bold leading-7 text-gray-900 sm:truncate sm:leading-9">
                  {t("shared.hi")} {user?.firstName && <span>{user?.firstName} 👋!</span>}
                </h1>
              </div>
              <dl className="flex flex-col sm:ml-3 sm:flex-row sm:flex-wrap">
                <dt className="sr-only">{t("models.user.email")}</dt>
                <dd className="flex items-center text-xs font-medium lowercase text-gray-500 sm:mr-6">
                  {/*Heroicon name: office-building */}
                  <svg
                    className="mr-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {user?.email}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
