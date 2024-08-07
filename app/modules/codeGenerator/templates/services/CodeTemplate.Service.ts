import { PropertyType } from "~/application/enums/entities/PropertyType";
import CodeGeneratorHelper from "~/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import CodeGeneratorPropertiesHelper from "../../utils/CodeGeneratorPropertiesHelper";

function generate({ entity }: { entity: EntityWithDetails }): string {
  const { capitalized, name } = CodeGeneratorHelper.getNames(entity);
  const imports: string[] = [];
  imports.push(`import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { getEntityByName } from "~/utils/db/entities/entities.db.server";
import { getRowById } from "~/utils/db/entities/rows.db.server";
import RowHelper from "~/utils/helpers/RowHelper";
import RowValueService, { RowValueUpdateDto } from "~/utils/helpers/.server/RowValueService";`);

  if (entity.properties.some((p) => p.type === PropertyType.MEDIA)) {
    imports.push(`import { RowMedia } from "@prisma/client";`);
  }

  imports.push(`import { ${capitalized}Dto } from "../dtos/${capitalized}Dto";
import { ${capitalized}CreateDto } from "../dtos/${capitalized}CreateDto";
import ${capitalized}Helpers from "../helpers/${capitalized}Helpers";`);

  let template = `
export namespace ${capitalized}Service {
  async function getEntity(tenantId: string | null) {
    let entityName = "${name}";
    const entity = await getEntityByName({ tenantId, name: entityName });
    if (!entity) {
      throw Error("Entity not found: " + entityName);
    }
    return entity;
  }
  export async function getAll({
    tenantId,
    userId,
    urlSearchParams,
  }: {
    tenantId: string | null;
    userId?: string;
    urlSearchParams?: URLSearchParams;
  }): Promise<{ items: ${capitalized}Dto[]; pagination: PaginationDto }> {
    const entity = await getEntity(tenantId);
    const data = await RowsApi.getAll({
      entity,
      tenantId,
      userId,
      urlSearchParams,
    });
    return {
      items: data.items.map((row) => ${capitalized}Helpers.rowToDto({ entity, row })),
      pagination: data.pagination,
    };
  }
  export async function get(id: string, session: { tenantId: string | null; userId?: string }): Promise<${capitalized}Dto | null> {
    const entity = await getEntity(session.tenantId);
    const { item, rowPermissions } = await RowsApi.get(id, {
      tenantId: session.tenantId,
      userId: session.userId,
      entity,
    });
    if (!rowPermissions.canRead) {
      return null;
    }
    return ${capitalized}Helpers.rowToDto({ entity, row: item });
  }
  export async function create(data: ${capitalized}CreateDto, session: { tenantId: string | null; userId?: string }): Promise<${capitalized}Dto> {
    const entity = await getEntity(session.tenantId);
    const rowValues = RowHelper.getRowPropertiesFromForm({
      entity,
      values: [
        {PROPERTIES_CREATE_VALUES}
      ],
    });
    const item = await RowsApi.create({
      tenantId: session.tenantId,
      userId: session.userId,
      entity,
      rowValues,
    });
    return ${capitalized}Helpers.rowToDto({ entity, row: item });
  }
  export async function update(id: string, data: Partial<${capitalized}Dto>, session: { tenantId: string | null; userId?: string }): Promise<${capitalized}Dto> {
    const entity = await getEntity(session.tenantId);
    const row = await getRowById(id);
    if (!row) {
      throw Error("Not found");
    }
    const values: RowValueUpdateDto[] = [];
    {PROPERTIES_UPDATE_VALUES}
    const item = await RowValueService.update({
      entity,
      row,
      values,
      session,
    });
    return ${capitalized}Helpers.rowToDto({ entity, row: item });
  }
  export async function del(id: string, session: { tenantId: string | null; userId?: string }): Promise<void> {
    const entity = await getEntity(session.tenantId);
    await RowsApi.del(id, {
      entity,
      tenantId: session.tenantId,
      userId: session.userId,
    });
  }
}`;

  const createValues: string[] = [];
  const updateValues: string[] = [];
  entity.properties
    .filter((f) => !f.isDefault)
    .forEach((property) => {
      if (property.showInCreate) {
        CodeGeneratorPropertiesHelper.createDtoToRow({ code: createValues, property });
      }
      CodeGeneratorPropertiesHelper.updateDtoToRow({ code: updateValues, property });
    });
  template = template.replace("{PROPERTIES_CREATE_VALUES}", createValues.join("\n        "));
  template = template.replace("{PROPERTIES_UPDATE_VALUES}", updateValues.join("\n    "));

  const uniqueImports = [...new Set(imports)];
  return [...uniqueImports, template].join("\n");
}

export default {
  generate,
};
