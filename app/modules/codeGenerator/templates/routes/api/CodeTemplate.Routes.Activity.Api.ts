/* eslint-disable no-template-curly-in-string */
import CodeGeneratorHelper from "~/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";

function generate({ entity }: { entity: EntityWithDetails }): string {
  const { capitalized, name } = CodeGeneratorHelper.getNames(entity);
  let template = `import { LoaderFunctionArgs, json, ActionFunction } from "@remix-run/node";
import { RowPermissionsDto } from "~/application/dtos/entities/RowPermissionsDto";
import { getTranslations } from "~/locale/i18next.server";
import NotificationService from "~/modules/notifications/services/.server/NotificationService";
import { RowCommentsApi } from "~/utils/api/.server/RowCommentsApi";
import { getEntityByName } from "~/utils/db/entities/entities.db.server";
import { setRowCommentReaction } from "~/utils/db/entities/rowCommentReaction.db.server";
import { getRowComment, updateRowComment } from "~/utils/db/entities/rowComments.db.server";
import { getRowById } from "~/utils/db/entities/rows.db.server";
import { LogWithDetails, getRowLogsById } from "~/utils/db/logs.db.server";
import { getUser } from "~/utils/db/users.db.server";
import { getUserRowPermission } from "~/utils/helpers/.server/PermissionsService";
import RowHelper from "~/utils/helpers/RowHelper";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { getUserInfo } from "~/utils/session.server";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";

export namespace ${capitalized}RoutesActivityApi {
  export type LoaderData = {
    metatags: MetaTagsDto;
    logs: LogWithDetails[];
    permissions: RowPermissionsDto;
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const tenantId = await getTenantIdOrNull({ request, params });
    const userId = (await getUserInfo(request)).userId;
    const { t } = await getTranslations(request);
    const row = await getRowById(params.id!);
    const permissions = await getUserRowPermission(row!, tenantId, userId);
    const data: LoaderData = {
      metatags: [{ title: t("shared.activity") + " | " + process.env.APP_NAME }],
      logs: await getRowLogsById(params.id!),
      permissions,
    };
    return json(data);
  };

  export type ActionData = {
    success?: string;
    error?: string;
  };
  export const action: ActionFunction = async ({ request, params }) => {
    const { t } = await getTranslations(request);
    const { userId } = await getUserInfo(request);
    const tenantId = await getTenantIdOrNull({ request, params });
    const form = await request.formData();
    const action = form.get("action")?.toString() ?? "";
    const user = await getUser(userId);
    const entity = await getEntityByName({ tenantId, name: "${name}" });
    if (action === "comment") {
      let comment = form.get("comment")?.toString();
      if (!comment) {
        return json({ error: t("shared.invalidForm") }, { status: 400 });
      }
      await RowCommentsApi.create(params.id!, {
        comment,
        userId,
      });
      const item = await getRowById(params.id!);
      if (item!.createdByUser) {
        await NotificationService.send({
          channel: "my-rows",
          to: item!.createdByUser,
          notification: {
            from: { user },
            message: ${"`${user?.email} commented on ${RowHelper.getRowFolio(entity, item!)}`"},
            // action: {
            //   title: t("shared.view"),
            //   url: "",
            // },
          },
        });
      }
      return json({ newComment: comment });
    } else if (action === "comment-reaction") {
      const rowCommentId = form.get("comment-id")?.toString();
      const reaction = form.get("reaction")?.toString();
      if (!rowCommentId || !reaction) {
        return json({ error: t("shared.invalidForm") }, { status: 400 });
      }
      await getRowComment(rowCommentId);
      await setRowCommentReaction({
        createdByUserId: userId,
        rowCommentId,
        reaction,
      });
      return json({ newCommentReaction: reaction });
    } else if (action === "comment-delete") {
      const rowCommentId = form.get("comment-id")?.toString();
      if (!rowCommentId) {
        return json({ error: t("shared.invalidForm") }, { status: 400 });
      }
      await updateRowComment(rowCommentId, { isDeleted: true });
      return json({ deletedComment: rowCommentId });
    } else {
      return json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  };
}
`;

  return template;
}

export default {
  generate,
};
