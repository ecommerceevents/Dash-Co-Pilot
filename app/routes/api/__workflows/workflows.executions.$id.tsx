import { LoaderFunctionArgs, json } from "@remix-run/node";
import WorkflowsService from "~/modules/workflowEngine/services/WorkflowsService";
import { validateApiKey } from "~/utils/services/apiService";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, { status: 405 });
  }
  try {
    const { tenant } = await validateApiKey(request, params);
    const execution = await WorkflowsService.getExecution(params.id!, {
      tenantId: tenant?.id ?? null,
    });
    if (!execution) {
      return json({ error: "Execution not found" }, { status: 404 });
    }
    return json({ execution }, { status: 200 });
  } catch (e: any) {
    return json({ error: e.message }, { status: 400 });
  }
};
