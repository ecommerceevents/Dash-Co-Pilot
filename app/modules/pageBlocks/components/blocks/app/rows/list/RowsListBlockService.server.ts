import { PageBlockLoaderArgs } from "~/modules/pageBlocks/dtos/PageBlockLoaderArgs";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { getTenantByIdOrSlug } from "~/utils/services/.server/urlService";
import { getUserInfo } from "~/utils/session.server";
import { BlockVariableService } from "../../../shared/variables/BlockVariableService.server";
import { RowsListBlockData } from "./RowsListBlockUtils";

export namespace RowsListBlockService {
  export async function load({ request, params, block }: PageBlockLoaderArgs): Promise<RowsListBlockData> {
    const entityName = BlockVariableService.getValue({ request, params, variable: block.rowsList?.variables?.entityName });
    const tenantId = BlockVariableService.getValue({ request, params, variable: block.rowsList?.variables?.tenantId });
    const pageSize = BlockVariableService.getValue({ request, params, variable: block.rowsList?.variables?.pageSize });

    const userInfo = await getUserInfo(request);
    const rowsData = await RowsApi.getAll({
      entity: { name: entityName! },
      tenantId: tenantId ? await getTenantByIdOrSlug(tenantId) : null,
      urlSearchParams: new URL(request.url).searchParams,
      pageSize: pageSize ? Number(pageSize) : undefined,
      userId: userInfo.userId,
    });
    return rowsData;
  }
}
