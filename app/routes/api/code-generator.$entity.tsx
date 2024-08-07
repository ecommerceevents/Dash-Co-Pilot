import { ActionFunctionArgs, json } from "@remix-run/node";
import { getEntityByName } from "~/utils/db/entities/entities.db.server";
import CodeGeneratorService, { CodeGeneratorOptions } from "~/modules/codeGenerator/service/CodeGeneratorService";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const entity = await getEntityByName({ tenantId: null, name: params.entity! });
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, { status: 405 });
  }
  try {
    const body = (await request.json()) as CodeGeneratorOptions;
    const file = await CodeGeneratorService.generate(body);
    if (!file) {
      return json({ success: "Files generated successfully." }, { status: 200 });
    }
    return new Response(file, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=${entity.slug}.zip`,
      },
    });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
