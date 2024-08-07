import CodeGeneratorHelper from "~/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import CodeGeneratorPropertiesHelper from "../../utils/CodeGeneratorPropertiesHelper";

function generate({ entity }: { entity: EntityWithDetails }): string {
  const { capitalized } = CodeGeneratorHelper.getNames(entity);
  const imports: string[] = [];
  imports.push(`import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import FormHelper from "~/utils/helpers/FormHelper";
import RowValueHelper from "~/utils/helpers/RowValueHelper";`);
  imports.push(`import { ${capitalized}Dto } from "../dtos/${capitalized}Dto";`);
  // if (entity.properties.some((p) => p.type === PropertyType.MEDIA)) {
  //   imports.push(`import { MediaDto } from "~/application/dtos/entities/MediaDto";`);
  // }

  let template = `
function rowToDto({ entity, row }: { entity: EntityWithDetails; row: RowWithDetails }): ${capitalized}Dto {
  return {
    row,
    prefix: entity.prefix,
    {PROPERTIES_ROW_TO_DTO}
  };
}

function formToDto(form: FormData): Partial<${capitalized}Dto> {
  return {
    {PROPERTIES_FORM_TO_DTO}
  };
}

export default {
  rowToDto,
  formToDto,
};`;

  const rowToDto: string[] = [];
  const formToDto: string[] = [];
  entity.properties
    .filter((f) => !f.isDefault)
    .forEach((property, index) => {
      CodeGeneratorPropertiesHelper.rowToDto({ code: rowToDto, property });
      CodeGeneratorPropertiesHelper.formToDto({ code: formToDto, property });
    });
  template = template.replace("{PROPERTIES_ROW_TO_DTO}", rowToDto.join("\n    "));
  template = template.replace("{PROPERTIES_FORM_TO_DTO}", formToDto.join("\n    "));

  const uniqueImports = [...new Set(imports)];
  return [...uniqueImports, template].join("\n");
}

export default {
  generate,
};
