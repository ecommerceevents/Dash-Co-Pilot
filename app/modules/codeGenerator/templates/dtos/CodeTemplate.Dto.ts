import CodeGeneratorHelper from "~/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import CodeGeneratorPropertiesHelper from "../../utils/CodeGeneratorPropertiesHelper";

function generate({ entity }: { entity: EntityWithDetails }): string {
  const { capitalized } = CodeGeneratorHelper.getNames(entity);
  const imports: string[] = [];
  const code: string[] = [];
  imports.push(`import { RowWithDetails } from "~/utils/db/entities/rows.db.server";`);

  code.push("");
  code.push(`export type ${capitalized}Dto = {`);
  code.push(`  row: RowWithDetails;`);
  code.push(`  prefix: string;`);
  code.push(`  // Custom Row Properties:`);
  entity.properties
    .filter((f) => !f.isDefault)
    .forEach((property) => {
      CodeGeneratorPropertiesHelper.type({ code, imports, property });
    });
  code.push("};");

  const uniqueImports = [...new Set(imports)];
  return [...uniqueImports, ...code].join("\n");
}

export default {
  generate,
};
