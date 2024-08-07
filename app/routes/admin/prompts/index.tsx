import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { db } from "~/utils/db.server";
import NumberUtils from "~/utils/shared/NumberUtils";

type LoaderData = {
  summary: {
    flowsTotal: number;
    templatesTotal: number;
    executionsTotal: number;
    resultsTotal: number;
  };
};
export const loader = async () => {
  const data: LoaderData = {
    summary: {
      flowsTotal: await db.promptFlow.count(),
      templatesTotal: await db.promptTemplate.count(),
      executionsTotal: await db.promptFlowExecution.count(),
      resultsTotal: await db.promptTemplateResult.count(),
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
      <dl className="grid grid-cols-2 gap-2">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow ">
          <dt className="truncate text-xs font-medium uppercase text-gray-500">
            <div>Prompt Flows</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">{NumberUtils.intFormat(data.summary.flowsTotal)}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow ">
          <dt className="truncate text-xs font-medium uppercase text-gray-500">
            <div>Templates</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">{NumberUtils.intFormat(data.summary.templatesTotal)}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow ">
          <dt className="truncate text-xs font-medium uppercase text-gray-500">
            <div>Executions</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">{NumberUtils.intFormat(data.summary.executionsTotal)}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow ">
          <dt className="truncate text-xs font-medium uppercase text-gray-500">
            <div>Results</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-gray-900">{NumberUtils.intFormat(data.summary.resultsTotal)}</dd>
        </div>
      </dl>
    </div>
  );
}
