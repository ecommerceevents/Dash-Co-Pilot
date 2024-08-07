import CodeGeneratorHelper from "~/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";

function generate({ entity }: { entity: EntityWithDetails }): string {
  const { capitalized, name } = CodeGeneratorHelper.getNames(entity);
  const imports: string[] = [];
  imports.push(`import { LoaderFunctionArgs, json, ActionFunction, redirect } from "@remix-run/node";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";
import { getTranslations } from "~/locale/i18next.server";
import UrlUtils from "~/utils/app/UrlUtils";
import { getPlanFeatureUsage } from "~/utils/services/.server/subscriptionService";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { getUserInfo } from "~/utils/session.server";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";`);
  imports.push(`import ${capitalized}Helpers from "../../helpers/${capitalized}Helpers";
import { ${capitalized}Service } from "../../services/${capitalized}Service";`);

  let template = `
export namespace ${capitalized}RoutesNewApi {
  export type LoaderData = {
    metatags: MetaTagsDto;
    featureUsage: PlanFeatureUsageDto | undefined;
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { t } = await getTranslations(request);
    const tenantId = await getTenantIdOrNull({ request, params });
    const data: LoaderData = {
      metatags: [{ title: t("shared.create") + " ${capitalized} | " + process.env.APP_NAME }],
      featureUsage: tenantId ? await getPlanFeatureUsage(tenantId, "${name}") : undefined,
    };
    return json(data);
  };

  export type ActionData = {
    success?: string;
    error?: string;
  };
  export const action: ActionFunction = async ({ request, params }) => {
    const { t } = await getTranslations(request);
    const tenantId = await getTenantIdOrNull({ request, params });
    const { userId } = await getUserInfo(request);
    const form = await request.formData();
    const action = form.get("action")?.toString();
    if (action === "create") {
      try {
        const { {PROPERTIES_CREATE_NAMES} } = ${capitalized}Helpers.formToDto(form);
        {PROPERTIES_CREATE_VALIDATION_REQUIRED}
        const item = await ${capitalized}Service.create(
          { {PROPERTIES_CREATE_NAMES} },
          { userId, tenantId }
        );
        return redirect(UrlUtils.getParentRoute(new URL(request.url).pathname) + "/" + item.row.id);
      } catch (error: any) {
        return json({ error: error.message }, { status: 400 });
      }
    } else {
      return json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  };
}`;

  const propertiesCreateNames: string[] = [];
  const propertiesCreateValidationRequired: string[] = [];
  entity.properties
    .filter((f) => !f.isDefault && f.showInCreate)
    .forEach((property) => {
      propertiesCreateNames.push(property.name);
      if (property.isRequired) {
        propertiesCreateValidationRequired.push(`if (${property.name} === undefined) throw new Error(t("${property.title}") + " is required");`);
      }
    });
  template = template.split("{PROPERTIES_CREATE_NAMES}").join(propertiesCreateNames.join(", "));
  template = template.split("{PROPERTIES_CREATE_VALIDATION_REQUIRED}").join(propertiesCreateValidationRequired.join("\n        "));

  const uniqueImports = [...new Set(imports)];
  return [...uniqueImports, template].join("\n");
}

export default {
  generate,
};
