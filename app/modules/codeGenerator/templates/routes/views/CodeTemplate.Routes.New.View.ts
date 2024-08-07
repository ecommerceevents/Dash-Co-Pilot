import CodeGeneratorHelper from "~/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";

function generate({ entity }: { entity: EntityWithDetails }): string {
  const { capitalized, title, plural } = CodeGeneratorHelper.getNames(entity);
  return `import { useActionData, useLocation } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import CheckPlanFeatureLimit from "~/components/core/settings/subscription/CheckPlanFeatureLimit";
import NewPageLayout from "~/components/ui/layouts/NewPageLayout";
import UrlUtils from "~/utils/app/UrlUtils";
import ${capitalized}Form from "../../components/${capitalized}Form";
import { ${capitalized}RoutesNewApi } from "../api/${capitalized}Routes.New.Api";
import { useTypedLoaderData } from "remix-typedjson";

export default function ${capitalized}RoutesNewView() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<${capitalized}RoutesNewApi.LoaderData>();
  const actionData = useActionData<${capitalized}RoutesNewApi.ActionData>();
  const location = useLocation();
  return (
    <NewPageLayout
      title={t("shared.create") + " " + t("${title}")}
      menu={[
        {
          title: t("${plural}"),
          routePath: UrlUtils.getParentRoute(location.pathname),
        },
        {
          title: t("shared.create"),
          routePath: "",
        },
      ]}
    >
      <div className="mx-auto max-w-2xl">
        <CheckPlanFeatureLimit item={data.featureUsage}>
          <${capitalized}Form isCreating={true} actionData={actionData} />
        </CheckPlanFeatureLimit>
      </div>
    </NewPageLayout>
  );
}
`;
}

export default {
  generate,
};
