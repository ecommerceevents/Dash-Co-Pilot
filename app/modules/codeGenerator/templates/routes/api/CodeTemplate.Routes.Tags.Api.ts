import CodeGeneratorHelper from "~/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";

function generate({ entity }: { entity: EntityWithDetails }): string {
  const { capitalized, name } = CodeGeneratorHelper.getNames(entity);
  return `import { EntityTag } from "@prisma/client";
import { LoaderFunctionArgs, json, ActionFunction } from "@remix-run/node";
import { Colors } from "~/application/enums/shared/Colors";
import { getTranslations } from "~/locale/i18next.server";
import { getEntityByName } from "~/utils/db/entities/entities.db.server";
import { getEntityTags, getEntityTag, createEntityTag, updateEntityTag, deleteEntityTag, getEntityTagById } from "~/utils/db/entities/entityTags.db.server";
import { getRowTag, createRowTag, deleteRowTags } from "~/utils/db/entities/rowTags.db.server";
import { getUserRowPermission } from "~/utils/helpers/.server/PermissionsService";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { getUserInfo } from "~/utils/session.server";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { ${capitalized}Dto } from "../../dtos/${capitalized}Dto";
import { ${capitalized}Service } from "../../services/${capitalized}Service";

export namespace ${capitalized}RoutesTagsApi {
  export type LoaderData = {
    metatags: MetaTagsDto;
    item: ${capitalized}Dto;
    tags: EntityTag[];
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { t } = await getTranslations(request);
    const tenantId = await getTenantIdOrNull({ request, params });
    const userId = (await getUserInfo(request)).userId;
    const entity = await getEntityByName({ tenantId, name: "${name}" });
    const item = await ${capitalized}Service.get(params.id!, {
      tenantId,
      userId,
    });
    if (!item) {
      return json({ error: t("shared.notFound"), status: 404 });
    }
    const data: LoaderData = {
      metatags: [{ title: t("models.row.tags") + " | " + process.env.APP_NAME }],
      item,
      tags: await getEntityTags(entity.id),
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
    const userId = (await getUserInfo(request)).userId;
    const form = await request.formData();
    const action = form.get("action")?.toString() ?? "";
    const entity = await getEntityByName({ tenantId, name: "${name}" });
    const item = await ${capitalized}Service.get(params.id!, {
      tenantId: await getTenantIdOrNull({ request, params }),
      userId: (await getUserInfo(request)).userId,
    });
    if (!item) {
      return json({ error: t("shared.notFound"), status: 404 });
    }
    const rowPermissions = await getUserRowPermission(item.row, tenantId, userId);
    if (!rowPermissions.canUpdate) {
      return json({ error: t("shared.unauthorized"), status: 403 });
    }
    if (action === "new-tag") {
      const value = form.get("tag-name")?.toString() ?? "";
      const color = Number(form.get("tag-color") ?? Colors.INDIGO);
      let tag = await getEntityTag(entity.id, value);
      if (!tag) {
        tag = await createEntityTag({
          entityId: entity.id,
          value,
          color,
        });
      }
      const existingTag = await getRowTag(params.id!, value);
      if (tag && !existingTag) {
        await createRowTag({
          rowId: params.id!,
          tagId: tag.id,
        });
      }
      return json({});
    } else if (action === "edit-tag") {
      const id = form.get("tag-id")?.toString() ?? "";
      const value = form.get("tag-name")?.toString() ?? "";
      const color = Number(form.get("tag-color"));
      await updateEntityTag(id, {
        value,
        color,
      });
      return json({});
    } else if (action === "set-tag") {
      const id = form.get("tag-id")?.toString() ?? "";
      const tagAction = form.get("tag-action")?.toString() ?? "";
      if (tagAction === "add") {
        await createRowTag({
          rowId: params.id!,
          tagId: id,
        });
      } else {
        await deleteRowTags(params.id!, id);
      }
      return json({});
    } else if (action === "delete-tag") {
      const id = form.get("tag-id")?.toString() ?? "";
      const tag = await getEntityTagById(id);
      if (tag) {
        await deleteEntityTag(tag.id);
      }
      return json({});
    } else {
      return json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  };
}
`;
}

export default {
  generate,
};
