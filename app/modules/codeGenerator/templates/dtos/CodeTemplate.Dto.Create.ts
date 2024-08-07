import CodeGeneratorHelper from "~/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import CodeGeneratorPropertiesHelper from "../../utils/CodeGeneratorPropertiesHelper";

function generate({ entity }: { entity: EntityWithDetails }): string {
  const { capitalized } = CodeGeneratorHelper.getNames(entity);
  const imports: string[] = [];
  const code: string[] = [];

  code.push("");
  code.push(`export type ${capitalized}CreateDto = {`);
  entity.properties
    .filter((f) => !f.isDefault && f.showInCreate)
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
