import { ActionFunctionArgs, json } from "@remix-run/node";
import WorkflowsExecutionsService from "~/modules/workflowEngine/services/WorkflowsExecutionsService";
import { validateApiKey } from "~/utils/services/apiService";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, { status: 405 });
  }
  try {
    const { tenant, userId } = await validateApiKey(request, params);
    let body: { [key: string]: any } = {};
    try {
      body = await request.json();
    } catch (e: any) {
      return json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const execution = await WorkflowsExecutionsService.execute(params.id!, {
      type: "api",
      input: body,
      session: {
        tenantId: tenant?.id ?? null,
        userId: userId ?? null,
      },
    });
    if (execution.error) {
      return json({ error: execution.error }, { status: 400 });
    } else {
      return json({ execution }, { status: 200 });
    }
  } catch (e: any) {
    return json({ error: e.message }, { status: 500 });
  }
};
