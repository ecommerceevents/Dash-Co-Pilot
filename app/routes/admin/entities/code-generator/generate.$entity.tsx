import { json, LoaderFunction } from "@remix-run/node";
import { getEntityByName } from "~/utils/db/entities/entities.db.server";
import CodeGeneratorService from "~/modules/codeGenerator/service/CodeGeneratorService";

export const loader: LoaderFunction = async ({ params }) => {
  const entity = await getEntityByName({ tenantId: null, name: params.entity! });
  const file = await CodeGeneratorService.generate({
    type: "dynamic",
    entity,
    moduleDirectory: `./app/modules/codeGeneratorTests/` + entity.slug,
    routesDirectory: `./app/routes/admin/entities/code-generator/tests/` + entity.slug,
    deleteFilesOnFinish: false,
    generateZip: false,
  });
  if (!file) {
    return json({ success: "Files generated successfully." }, { status: 200 });
  }
  return new Response(file, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=${entity.slug}.zip`,
    },
  });
};
