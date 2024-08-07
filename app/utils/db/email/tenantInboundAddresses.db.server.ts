import { db } from "~/utils/db.server";

export async function getTenantInboundAddress(addresses: string[]) {
  return await db.tenantInboundAddress.findMany({
    where: {
      address: {
        in: addresses,
      },
    },
  });
}

export async function getTenantInboundAddressById(id: string) {
  return await db.tenantInboundAddress.findUnique({
    where: {
      id,
    },
  });
}
