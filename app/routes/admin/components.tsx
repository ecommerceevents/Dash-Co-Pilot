import { useTranslation } from "react-i18next";
import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import AllComponentsList from "~/components/ui/AllComponentsList";
import { getTranslations } from "~/locale/i18next.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  return json({
    title: `${t("admin.components.title")} | ${process.env.APP_NAME}`,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function AdminComponentsRoute() {
  const { t } = useTranslation();
  return (
    <div>
      <div className="w-full border-b border-gray-300 bg-white py-2 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between space-x-2 px-4 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-screen-2xl">
          <h1 className="flex flex-1 items-center truncate font-bold">{t("admin.components.title")}</h1>
        </div>
      </div>
      <div className="mx-auto max-w-5xl space-y-2 px-4 pt-2 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-screen-2xl">
        <AllComponentsList withSlideOvers={true} />
      </div>
    </div>
  );
}
