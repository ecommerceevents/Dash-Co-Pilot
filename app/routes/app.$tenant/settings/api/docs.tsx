import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import ApiSpecs from "~/modules/api/components/ApiSpecs";
import ApiSpecsService, { ApiSpecsDto } from "~/modules/api/services/ApiSpecsService";
import UrlUtils from "~/utils/app/UrlUtils";

type LoaderData = {
  apiSpecs: ApiSpecsDto;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const apiSpecs = await ApiSpecsService.generateSpecs({ request });
  const data: LoaderData = {
    apiSpecs,
  };
  return json(data);
};

export default function AdminApiDocsRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const params = useParams();
  return (
    <>
      <IndexPageLayout
        replaceTitleWithTabs={true}
        tabs={[
          {
            name: t("shared.overview"),
            routePath: UrlUtils.getModulePath(params, "api"),
          },
          {
            name: t("models.apiCall.plural"),
            routePath: UrlUtils.getModulePath(params, "api/logs"),
          },
          {
            name: t("models.apiKey.plural"),
            routePath: UrlUtils.getModulePath(params, "api/keys"),
          },
          {
            name: "Docs",
            routePath: UrlUtils.getModulePath(params, "api/docs"),
          },
        ]}
      >
        <ApiSpecs item={data.apiSpecs} />
      </IndexPageLayout>
    </>
  );
}
