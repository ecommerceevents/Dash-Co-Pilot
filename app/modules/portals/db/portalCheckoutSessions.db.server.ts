import { db } from "~/utils/db.server";

export async function getCheckoutSessionStatus(id: string) {
  return db.portalCheckoutSessionStatus.findUnique({
    where: { id },
  });
}

export async function createCheckoutSessionStatus(data: { id: string; portalId: string; email: string; fromUrl: string; fromUserId?: string | null }) {
  return db.portalCheckoutSessionStatus.create({
    data: {
      id: data.id,
      portalId: data.portalId,
      pending: true,
      email: data.email,
      fromUrl: data.fromUrl,
      fromUserId: data.fromUserId ?? null,
    },
  });
}

export async function updateCheckoutSessionStatus(
  id: string,
  data: {
    pending: boolean;
    createdUserId?: string | null;
  }
) {
  return db.portalCheckoutSessionStatus.update({
    where: {
      id,
    },
    data: {
      pending: data.pending,
      createdUserId: data.createdUserId ?? null,
    },
  });
}
