import { Link } from "@remix-run/react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import { useRootData } from "~/utils/data/useRootData";
import GridBlockUtils from "../../shared/grid/GridBlockUtils";
import { CommunityBlockDto } from "./CommunityBlockUtils";

export default function CommunityVariantSimple({ item }: { item: CommunityBlockDto }) {
  const { debug } = useRootData();
  const { t } = useTranslation();
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-24">
        <div className="space-y-8 text-center sm:space-y-12">
          <div className="space-y-5 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t(item.headline)}</h2>
            <p className="text-xl text-gray-500">{t(item.subheadline)}</p>
            {item.cta && (
              <div className="flex flex-col justify-center space-y-1 sm:flex-row sm:space-x-2 sm:space-y-0">
                {item.cta.map((item) => {
                  return (
                    <div key={item.href} className="rounded-md ">
                      {item.href.startsWith("http") ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className={clsx(
                            "group flex w-full items-center justify-center space-x-2 truncate rounded-md border px-8 py-3 text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-900 md:px-4 md:py-2"
                          )}
                        >
                          {t(item.text)}
                        </a>
                      ) : (
                        <Link
                          to={item.href}
                          className={clsx(
                            "group flex w-full items-center justify-center space-x-2 truncate rounded-md border px-8 py-3 text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-900 md:px-4 md:py-2"
                          )}
                        >
                          {t(item.text)}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {item.data?.members && (
            <div className="mx-auto lg:max-w-5xl">
              <ul className={item.grid ? GridBlockUtils.getClasses(item.grid) : "flex flex-wrap justify-center"}>
                {item.data.members.map((member) => {
                  const card = (
                    <li key={member.user}>
                      <div className="space-y-4">
                        <img
                          className="mx-auto h-10 w-10 flex-shrink-0 rounded-full sm:h-12 sm:w-12 lg:h-14 lg:w-14"
                          src={member.avatar_url}
                          alt={member.user}
                        />
                        {item.withName && (
                          <div>
                            <div className="mt-2 text-xs font-medium lg:text-sm">
                              <h4 className="truncate text-gray-500">{member.user}</h4>
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                  if (member.url) {
                    return (
                      <Link key={member.user} to={member.url} className="hover:underline" target="_blank">
                        {card}
                      </Link>
                    );
                  }
                  return card;
                })}
              </ul>
            </div>
          )}
        </div>
        {item.type === "github" && debug && (
          <WarningBanner
            title="Warning"
            text="By default, GitHub members will not load on development environment. Go to app/utils/integrations/githubService.ts to enable it."
          />
        )}
      </div>
    </div>
  );
}
