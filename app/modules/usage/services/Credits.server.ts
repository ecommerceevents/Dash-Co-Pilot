import { createCredit } from "../db/credits.db.server";
import { CreditType, CreditTypes } from "../dtos/CreditType";

async function create(data: { tenantId: string; userId: string | null; type: CreditType; objectId: string | null }) {
  const creditType = CreditTypes.find((t) => t.value === data.type);
  if (!creditType) {
    // eslint-disable-next-line no-console
    console.error(`Credit type not found: ${data.type}`);
    return;
  }
  return await createCredit({
    tenantId: data.tenantId,
    userId: data.userId,
    type: data.type,
    objectId: data.objectId,
    amount: creditType.amount,
  });
}
export default {
  create,
};
