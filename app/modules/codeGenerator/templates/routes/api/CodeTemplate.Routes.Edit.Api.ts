/* eslint-disable no-template-curly-in-string */
import CodeGeneratorHelper from "~/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";

function generate({ entity }: { entity: EntityWithDetails }): string {
  const { capitalized, name } = CodeGeneratorHelper.getNames(entity);
  const imports: string[] = [
    `import { LoaderFunctionArgs, json, ActionFunction, redirect } from "@remix-run/node";
import { RowPermissionsDto } from "~/application/dtos/entities/RowPermissionsDto";
import { getTranslations } from "~/locale/i18next.server";
import NotificationService from "~/modules/notifications/services/.server/NotificationService";
import UrlUtils from "~/utils/app/UrlUtils";
import { getEntityByName } from "~/utils/db/entities/entities.db.server";
import { getRowById } from "~/utils/db/entities/rows.db.server";
import { getUser } from "~/utils/db/users.db.server";
import { getUserRowPermission } from "~/utils/helpers/.server/PermissionsService";
import RowHelper from "~/utils/helpers/RowHelper";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { getUserInfo } from "~/utils/session.server";
import NumberUtils from "~/utils/shared/NumberUtils";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";`,
  ];

  if (entity.hasTasks) {
    imports.push(
      `import { RowTaskWithDetails, getRowTasks, createRowTask, getRowTask, updateRowTask, deleteRowTask } from "~/utils/db/entities/rowTasks.db.server";`
    );
  }

  imports.push(`import { ${capitalized}Dto } from "../../dtos/${capitalized}Dto";
import ${capitalized}Helpers from "../../helpers/${capitalized}Helpers";
import { ${capitalized}Service } from "../../services/${capitalized}Service";`);

  let template = `
export namespace ${capitalized}RoutesEditApi {
  export type LoaderData = {
    metatags: MetaTagsDto;
    item: ${capitalized}Dto;
    permissions: RowPermissionsDto;
    {TASKS_LOADER_INTERFACE}
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { t } = await getTranslations(request);
    const tenantId = await getTenantIdOrNull({ request, params });
    const userId = (await getUserInfo(request)).userId;
    const item = await ${capitalized}Service.get(params.id!, {
      tenantId,
      userId,
    });
    if (!item) {
      return json({ error: t("shared.notFound"), status: 404 });
    }
    const permissions = await getUserRowPermission(item.row, tenantId, userId);
    if (!permissions.canRead) {
      return json({ error: t("shared.unauthorized"), status: 404 });
    }
    const data: LoaderData = {
      metatags: [{ title: item.prefix + "-" + NumberUtils.pad(item.row.folio ?? 0, 4) + " | " + process.env.APP_NAME }],
      item,
      permissions,
      {TASKS_LOADER_DATA}
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
    const user = await getUser(userId);
    const entity = await getEntityByName({ tenantId, name: "${name}" });
    const item = await getRowById(params.id!);
    if (!item) {
      return json({ error: t("shared.notFound"), status: 404 });
    }
    if (action === "edit") {
      try {
        const { {PROPERTIES_UPDATE_NAMES} } = ${capitalized}Helpers.formToDto(form);
        await ${capitalized}Service.update(
          params.id!,
          { {PROPERTIES_UPDATE_NAMES} },
          { tenantId, userId }
        );
        if (item.createdByUser) {
          await NotificationService.send({
            channel: "my-rows",
            to: item.createdByUser,
            notification: {
              from: { user },
              message: ${"`${user?.email} updated ${RowHelper.getRowFolio(entity, item)}`"},
              // action: {
              //   title: t("shared.view"),
              //   url: "",
              // },
            },
          });
        }
        return json({ success: t("shared.updated") });
      } catch (error: any) {
        return json({ error: error.message }, { status: 400 });
      }
    } else if (action === "delete") {
      try {
        await ${capitalized}Service.del(params.id!, {
          tenantId,
          userId,
        });
        if (item.createdByUser) {
          await NotificationService.send({
            channel: "my-rows",
            to: item.createdByUser,
            notification: {
              from: { user },
              message: ${"`${user?.email} deleted ${RowHelper.getRowFolio(entity, item)}`"},
            },
          });
        }
        return redirect(UrlUtils.getParentRoute(new URL(request.url).pathname));
      } catch (error: any) {
        return json({ error: error.message }, { status: 400 });
      }
    } {TASKS_ACTIONS}
    else {
      return json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  };
}`;

  const propertiesUpdateNames: string[] = [];
  entity.properties
    .filter((f) => f.showInCreate && !f.isDefault)
    .forEach((property) => {
      propertiesUpdateNames.push(property.name);
    });
  template = template.split("{PROPERTIES_UPDATE_NAMES}").join(propertiesUpdateNames.join(", "));

  const tasksLoaderInterface: string[] = [];
  const tasksLoaderData: string[] = [];
  if (entity.hasTasks) {
    tasksLoaderInterface.push("tasks: RowTaskWithDetails[]");
    tasksLoaderData.push(`tasks: await getRowTasks(params.id!),`);
  }
  template = template.split("{TASKS_LOADER_INTERFACE}").join(tasksLoaderInterface.join("\n      "));
  template = template.split("{TASKS_LOADER_DATA}").join(tasksLoaderData.join("\n      "));

  let tasksActions = "";
  if (entity.hasTasks) {
    tasksActions = `else if (action === "task-new") {
      const taskTitle = form.get("task-title")?.toString();
      if (!taskTitle) {
        return json({ error: t("shared.invalidForm") }, { status: 400 });
      }
      const task = await createRowTask({
        createdByUserId: userId,
        rowId: item.id,
        title: taskTitle,
      });
      return json({ newTask: task });
    } else if (action === "task-complete-toggle") {
      const taskId = form.get("task-id")?.toString() ?? "";
      const task = await getRowTask(taskId);
      if (task) {
        if (task.completed) {
          await updateRowTask(taskId, {
            completed: false,
            completedAt: null,
            completedByUserId: null,
          });
        } else {
          await updateRowTask(taskId, {
            completed: true,
            completedAt: new Date(),
            completedByUserId: userId,
          });
        }
      }
      return json({ completedTask: taskId });
    } else if (action === "task-delete") {
      const taskId = form.get("task-id")?.toString() ?? "";
      const task = await getRowTask(taskId);
      if (task) {
        await deleteRowTask(taskId);
      }
      return json({ deletedTask: taskId });
    }`;
  }
  template = template.split("{TASKS_ACTIONS}").join(tasksActions);

  const uniqueImports = [...new Set(imports)];
  return [...uniqueImports, template].join("\n");
}

export default {
  generate,
};
