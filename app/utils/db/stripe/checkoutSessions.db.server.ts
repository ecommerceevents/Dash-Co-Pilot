import { db } from "~/utils/db.server";

export async function getCheckoutSessionStatus(id: string) {
  return db.checkoutSessionStatus.findUnique({
    where: { id },
  });
}

export async function createCheckoutSessionStatus(data: {
  id: string;
  email: string;
  fromUrl: string;
  fromUserId?: string | null;
  fromTenantId?: string | null;
}) {
  return db.checkoutSessionStatus.create({
    data: {
      id: data.id,
      pending: true,
      email: data.email,
      fromUrl: data.fromUrl,
      fromUserId: data.fromUserId ?? null,
      fromTenantId: data.fromTenantId ?? null,
    },
  });
}

export async function updateCheckoutSessionStatus(
  id: string,
  data: {
    pending: boolean;
    createdUserId?: string | null;
    createdTenantId?: string | null;
  }
) {
  return db.checkoutSessionStatus.update({
    where: {
      id,
    },
    data: {
      pending: data.pending,
      createdUserId: data.createdUserId ?? null,
      createdTenantId: data.createdTenantId ?? null,
    },
  });
}
