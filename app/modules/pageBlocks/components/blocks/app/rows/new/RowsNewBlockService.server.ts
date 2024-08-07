import { json, redirect } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import { PageBlockActionArgs } from "~/modules/pageBlocks/dtos/PageBlockActionArgs";
import { PageBlockLoaderArgs } from "~/modules/pageBlocks/dtos/PageBlockLoaderArgs";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { getAllEntities, getEntityByName } from "~/utils/db/entities/entities.db.server";
import { getEntityPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import RowHelper from "~/utils/helpers/RowHelper";
import { getUserInfo } from "~/utils/session.server";
import { BlockVariableService } from "../../../shared/variables/BlockVariableService.server";
import { RowsNewBlockData } from "./RowsNewBlockUtils";
import EntityHelper from "~/utils/helpers/EntityHelper";

export namespace RowsNewBlockService {
  export async function load({ request, params, block }: PageBlockLoaderArgs): Promise<RowsNewBlockData> {
    const entityName = BlockVariableService.getValue({ request, params, variable: block.rowsNew?.variables?.entityName });
    const tenantId = BlockVariableService.getValue({ request, params, variable: block.rowsNew?.variables?.tenantId });

    const userId = (await getUserInfo(request)).userId;
    const entity = await getEntityByName({ tenantId, name: entityName! });
    const entityData = await EntitiesApi.get({
      entity,
      tenantId,
      userId,
    });
    return {
      entityData,
      allEntities: await getAllEntities({ tenantId }),
      relationshipRows: await RowsApi.getRelationshipRows({ entity, tenantId, userId }),
    };
  }
  export async function create({ request, params, form }: PageBlockActionArgs) {
    const entityName = form.get("rows-entity")?.toString();
    const tenantId = form.get("rows-tenant")?.toString() ?? null;
    const redirectTo = form.get("rows-redirectTo")?.toString();

    const userInfo = await getUserInfo(request);
    const entity = await getEntityByName({ tenantId, name: entityName! });

    const { t } = await getTranslations(request);
    await verifyUserHasPermission(request, getEntityPermission(entity, "create"), tenantId);
    const rowValues = RowHelper.getRowPropertiesFromForm({ t, entity, form });
    const newRow = await RowsApi.create({
      entity,
      tenantId,
      userId: userInfo.userId,
      rowValues,
      request,
    });
    if (redirectTo) {
      return redirect(redirectTo.replace(":id", newRow.id.toString()));
    }
    const onCreatedRedirect = form.get("onCreatedRedirect");
    if (onCreatedRedirect) {
      if (onCreatedRedirect === "addAnother") {
        return json({ saveAndAdd: true, newRow });
      }
      const routes = EntityHelper.getRoutes({ routes: EntitiesApi.getNoCodeRoutes({ request, params }), entity, item: newRow });
      if (routes) {
        if (!entity.onCreated || entity.onCreated === "redirectToOverview") {
          return redirect(routes?.overview ?? "");
        } else if (entity.onCreated === "redirectToEdit") {
          return redirect(routes?.edit ?? "");
        } else if (entity.onCreated === "redirectToList") {
          return redirect(routes?.list ?? "");
        } else if (entity.onCreated === "redirectToNew") {
          return json({ newRow, replace: true });
        }
      }
    }
    return json({ newRow });
  }
}
