import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import TableSimple from "~/components/ui/tables/TableSimple";
import DateUtils from "~/utils/shared/DateUtils";
import { OnboardingWithDetails } from "../db/onboarding.db.server";
import OnboardingBadge from "./OnboardingBadge";

export default function OnboardingsList({ items, groupByStatus }: { items: OnboardingWithDetails[]; groupByStatus: { status: string; count: number }[] }) {
  const { t } = useTranslation();
  return (
    <TableSimple
      items={items}
      actions={[{ title: t("shared.overview"), onClickRoute: (_, i) => `${i.id}` }]}
      headers={[
        {
          name: "title",
          title: t("onboarding.object.title"),
          className: "w-full",
          value: (i) => (
            <Link to={`/admin/onboarding/onboardings/${i.id}`} className="group flex flex-col">
              <div className="flex items-center space-x-2">
                <div className="text-base font-bold group-hover:underline">{i.title}</div>
                <div>
                  <OnboardingBadge item={i} />
                </div>
                {i.createdAt ? (
                  <>
                    <div>•</div>
                    <div className="text-sm text-gray-500">
                      <span>{DateUtils.dateAgo(i.createdAt)}</span>
                    </div>
                  </>
                ) : null}
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-500">
                  {i.sessions.length} {t("onboarding.session.plural").toLowerCase()}
                </div>
                <div>•</div>
                <div className="text-sm text-gray-500">
                  {i.sessions.filter((f) => f.status === "active").length} {t("onboarding.object.sessions.active").toLowerCase()}
                </div>
                <div>•</div>
                <div className="text-sm text-gray-500">
                  {i.sessions.filter((f) => f.status === "started").length} {t("onboarding.object.sessions.started").toLowerCase()}
                </div>
                <div>•</div>
                <div className="text-sm text-gray-500">
                  {i.sessions.filter((f) => f.status === "dismissed").length} {t("onboarding.object.sessions.dismissed").toLowerCase()}
                </div>
                <div>•</div>
                <div className="text-sm text-gray-500">
                  {i.sessions.filter((f) => f.status === "completed").length} {t("onboarding.object.sessions.completed").toLowerCase()}
                </div>
              </div>
            </Link>
          ),
        },
      ]}
      noRecords={
        <div className="p-12 text-center">
          <h3 className="mt-1 text-sm font-medium text-gray-900">{t("onboarding.object.empty.title")}</h3>
          <p className="mt-1 text-sm text-gray-500">{t("onboarding.object.empty.description")}</p>
        </div>
      }
    />
  );
}
