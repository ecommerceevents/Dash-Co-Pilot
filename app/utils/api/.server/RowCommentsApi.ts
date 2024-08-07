import { getEntityByIdOrName } from "~/utils/db/entities/entities.db.server";
import { getRowById } from "~/utils/db/entities/rows.db.server";
import { createManualRowLog } from "../../db/logs.db.server";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import { createRowComment } from "../../db/entities/rowComments.db.server";

export namespace RowCommentsApi {
  export async function create(
    id: string,
    {
      comment,
      userId,
    }: {
      comment: string;
      userId: string;
    }
  ) {
    const item = await getRowById(id);
    const entity = await getEntityByIdOrName({ tenantId: null, id: item?.entityId });
    if (!item || !entity) {
      throw new Error("Row not found");
    }
    const created = await createRowComment({
      createdByUserId: userId,
      rowId: id,
      value: comment,
    });
    await createManualRowLog({
      tenantId: item.tenantId,
      createdByUserId: userId,
      action: DefaultLogActions.Commented,
      entity,
      item,
      commentId: created.id,
    });
    return created;
  }
}
