import RowHelper from "~/utils/helpers/RowHelper";
import RowValueHelper from "~/utils/helpers/RowValueHelper";
import EntitiesSingleton from "./EntitiesSingleton";
import { RowDto } from "./RowDto";

export default class RowModel {
  row: RowDto;
  constructor(
    row: RowDto,
    options?: {
      metadata?: string | null;
    }
  ) {
    this.row = row;
    try {
      if (options?.metadata) {
        this.row.metadata = options?.metadata ? JSON.parse(options.metadata) : null;
      }
    } catch {}
  }
  public getEntity() {
    const entities = EntitiesSingleton.getInstance().getEntities();
    const entity = entities.find((entity) => entity.id === this.row.entityId);
    if (!entity) {
      throw new Error("Entity not found with ID: " + this.row.entityId);
    }
    return entity;
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
    const rows = this.row.parentRows
      .filter((r) => r.relationshipId === relationship.id)
      .sort((a, b) => {
        return a.createdAt > b.createdAt ? -1 : 1;
      });
    return rows.map(({ parent, metadata }) => new RowModel(parent, { metadata }));
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
    const rows = this.row.childRows
      .filter((r) => r.relationshipId === relationship.id)
      .sort((a, b) => {
        return a.createdAt > b.createdAt ? -1 : 1;
      });
    return rows.map(({ child, metadata }) => new RowModel(child, { metadata }));
  }
  public getFirstChild(entityName: string) {
    const children = this.getChildren(entityName);
    if (children.length === 0) {
      return null;
    }
    return children[0];
  }
  public getRelated(entityName: string) {
    const children = this.getChildren(entityName);
    const parents = this.getParents(entityName);
    return [...children, ...parents];
  }
  public getText(name: string) {
    return RowValueHelper.getText({ row: this.row, entity: this.getEntity(), name });
  }
  public getBoolean(name: string) {
    return RowValueHelper.getBoolean({ row: this.row, entity: this.getEntity(), name });
  }
  public getNumber(name: string) {
    return RowValueHelper.getNumber({ row: this.row, entity: this.getEntity(), name });
  }
  public getDate(name: string) {
    return RowValueHelper.getDate({ row: this.row, entity: this.getEntity(), name });
  }
  public getMedia(name: string) {
    return RowValueHelper.getMedia({ row: this.row, entity: this.getEntity(), name });
  }
  public getFirstMedia(name: string) {
    return RowValueHelper.getFirstMedia({ row: this.row, entity: this.getEntity(), name });
  }
  public getFirstMediaFile(name: string) {
    return RowValueHelper.getFirstMediaFile({ row: this.row, entity: this.getEntity(), name });
  }
  public getMediaPublicUrl(name: string) {
    return RowValueHelper.getFirstMedia({ row: this.row, entity: this.getEntity(), name })?.publicUrl;
  }
  public getMediaPublicUrlOrFile(name: string) {
    const value = RowValueHelper.getFirstMedia({ row: this.row, entity: this.getEntity(), name });
    return value?.publicUrl || value?.file;
  }
  public getSelected(name: string) {
    return RowValueHelper.getSelected({ row: this.row, entity: this.getEntity(), name });
  }
  public getMultiple(name: string) {
    return RowValueHelper.getMultiple({ row: this.row, entity: this.getEntity(), name });
  }
  public getNumberRange(name: string) {
    return RowValueHelper.getNumberRange({ row: this.row, entity: this.getEntity(), name });
  }
  public getDateRange(name: string) {
    return RowValueHelper.getDateRange({ row: this.row, entity: this.getEntity(), name });
  }
  public getValue(name: string) {
    const property = this.getEntity().properties.find((p) => p.name === name);
    const value = this.row.values.find((v) => v.propertyId === property?.id);
    return {
      property,
      value,
    };
  }
  public toString() {
    return RowHelper.getTextDescription({ item: this.row, entity: this.getEntity() });
  }
}
