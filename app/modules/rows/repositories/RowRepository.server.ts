import { RowMedia } from "@prisma/client";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { RowValueMultipleDto } from "~/application/dtos/entities/RowValueMultipleDto";
import { RowValueRangeDto } from "~/application/dtos/entities/RowValueRangeDto";
import { RowRelationshipsApi } from "~/utils/api/.server/RowRelationshipsApi";
import RowValueService, { RowValueUpdateDto } from "~/utils/helpers/.server/RowValueService";
import EntitiesSingleton from "./EntitiesSingleton";
import RowModel from "./RowModel";
import { RowDto } from "./RowDto";

export default class RowRepository extends RowModel {
  session: { tenantId: string | null; userId?: string } | undefined;
  constructor(
    row: RowDto,
    options?: {
      session?: { tenantId: string | null; userId?: string } | undefined;
    }
  ) {
    super(row);
    this.session = options?.session;
  }
  private async update(value: RowValueUpdateDto, options?: { checkPermissions?: boolean; createLog?: boolean }) {
    await RowValueService.update({
      entity: this.getEntity(),
      row: this.row,
      session: this.session,
      values: [value],
      checkPermissions: options?.checkPermissions,
      options: { createLog: options?.createLog },
    });
  }
  public async updateMany(values: RowValueUpdateDto[], options?: { checkPermissions?: boolean; createLog?: boolean }) {
    await RowValueService.update({
      entity: this.getEntity(),
      row: this.row,
      session: this.session,
      values,
      checkPermissions: options?.checkPermissions,
      options: { createLog: options?.createLog },
    });
  }
  public async updateText(name: string, textValue: string | undefined, options?: { checkPermissions?: boolean; createLog?: boolean }) {
    const value: RowValueUpdateDto = { name, textValue };
    await this.update(value, options);
  }
  public async updateNumber(name: string, numberValue: number | undefined, options?: { checkPermissions?: boolean; createLog?: boolean }) {
    const value: RowValueUpdateDto = { name, numberValue };
    await this.update(value, options);
  }
  public async updateBoolean(name: string, booleanValue: boolean | undefined, options?: { checkPermissions?: boolean; createLog?: boolean }) {
    const value: RowValueUpdateDto = { name, booleanValue };
    await this.update(value, options);
  }
  public async updateDate(name: string, dateValue: Date | undefined, options?: { checkPermissions?: boolean; createLog?: boolean }) {
    const value: RowValueUpdateDto = { name, dateValue };
    await this.update(value, options);
  }
  public async updateMedia(name: string, media: MediaDto[] | undefined, options?: { checkPermissions?: boolean; createLog?: boolean }) {
    const value: RowValueUpdateDto = { name, media: media as RowMedia[] };
    await this.update(value, options);
  }
  public async updateMultiple(name: string, multiple: RowValueMultipleDto[] | undefined, options?: { checkPermissions?: boolean; createLog?: boolean }) {
    const value: RowValueUpdateDto = { name, multiple };
    await this.update(value, options);
  }
  public async updateRange(name: string, range: RowValueRangeDto | undefined, options?: { checkPermissions?: boolean; createLog?: boolean }) {
    const value: RowValueUpdateDto = { name, range };
    await this.update(value, options);
  }
  public async addChild(
    relatedRow:
      | { id: string; entityId: string }
      | {
          id: string;
          entityName: string;
        },
    options?: { metadata?: { [key: string]: any } | null }
  ) {
    const allEntities = EntitiesSingleton.getInstance().getEntities();
    let metadataString: string | null = null;
    if (options?.metadata) {
      try {
        metadataString = JSON.stringify(options?.metadata);
      } catch {}
    }
    return await RowRelationshipsApi.createRelationship({ parent: this.row, child: relatedRow, metadata: metadataString, allEntities });
  }
  public async removeChild(relatedRow: { id: string; entityId: string } | { id: string; entityName: string }) {
    const deleted = await RowRelationshipsApi.deleteRelationship({ parent: this.row, child: relatedRow });
    if (deleted.count) {
      return;
    }
    // remove child
    if (!("childRows" in this.row)) {
      return [];
    }
    const childRowIndex = this.row.childRows.findIndex((r) => r.childId === relatedRow.id);
    if (childRowIndex !== -1) {
      this.row.childRows.splice(childRowIndex, 1);
    }
  }
  public async addParent(
    relatedRow: { id: string; entityId: string } | { id: string; entityName: string },
    options?: { metadata?: { [key: string]: any } | null }
  ) {
    const allEntities = EntitiesSingleton.getInstance().getEntities();
    let metadataString: string | null = null;
    if (options?.metadata) {
      try {
        metadataString = JSON.stringify(options.metadata);
      } catch {}
    }
    return await RowRelationshipsApi.createRelationship({ parent: relatedRow, child: this.row, metadata: metadataString, allEntities });
  }
  public async removeParent(relatedRow: { id: string; entityId: string } | { id: string; entityName: string }) {
    return await RowRelationshipsApi.deleteRelationship({ parent: relatedRow, child: this.row });
  }
  public getParents(entityName: string) {
    const allEntities = EntitiesSingleton.getInstance().getEntities();
    const entity = allEntities.find((e) => e.name === entityName);
    const relationship = this.getEntity().parentEntities.find((e) => e.parentId === entity?.id);
    if (!relationship) {
      return [];
    }
    if (!("parentRows" in this.row)) {
      return [];
    }
    const rows = this.row.parentRows.filter((r) => r.relationshipId === relationship.id).map((r) => r.parent);
    return rows.map((row) => new RowRepository(row));
  }
  public getFirstParent(entityName: string) {
    const parents = this.getParents(entityName);
    if (parents.length === 0) {
      return null;
    }
    return parents[0];
  }
  public getChildren(entityName: string) {
    const allEntities = EntitiesSingleton.getInstance().getEntities();
    const entity = allEntities.find((e) => e.name === entityName);
    const relationship = this.getEntity().childEntities.find((e) => e.childId === entity?.id);
    if (!relationship) {
      return [];
    }
    if (!("childRows" in this.row)) {
      return [];
    }
    const rows = this.row.childRows.filter((r) => r.relationshipId === relationship.id).map((r) => r.child);
    return rows.map((row) => new RowRepository(row));
  }
  public getFirstChild(entityName: string) {
    const children = this.getChildren(entityName);
    if (children.length === 0) {
      return null;
    }
    return children[0];
  }
}
