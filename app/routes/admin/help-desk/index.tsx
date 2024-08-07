import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { db } from "~/utils/db.server";
import NumberUtils from "~/utils/shared/NumberUtils";

type LoaderData = {
  summary: {
    feedbackTotal: number;
  };
};
export const loader = async () => {
  const data: LoaderData = {
    summary: {
      feedbackTotal: await db.feedback.count(),
    },
  };
  return json(data);
};

export default function () {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{t("shared.overview")}</h3>
      </div>
      <dl className="grid gap-2 sm:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow">
          <dt className="truncate text-xs font-medium uppercase text-gray-500">
            <div>{t("feedback.plural")}</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">{NumberUtils.intFormat(data.summary.feedbackTotal)}</dd>
        </div>
      </dl>
    </div>
  );
}
