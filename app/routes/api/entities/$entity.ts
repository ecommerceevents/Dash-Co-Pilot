import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getEntityByName } from "~/utils/db/entities/entities.db.server";
import invariant from "tiny-invariant";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";

// GET
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, `api.entities.${params.entity}`);
  invariant(params.entity, "Expected params.entity");
  try {
    return json(await time(getEntityByName({ tenantId: null, name: params.entity }), "getEntityByName"), { headers: getServerTimingHeader() });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error({ error: e.message });
    return json({ error: JSON.stringify(e) }, { status: 400, headers: getServerTimingHeader() });
  }
};
