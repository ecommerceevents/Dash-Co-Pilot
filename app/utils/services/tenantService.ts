import UrlUtils from "../app/UrlUtils";
import { db } from "../db.server";
import { deleteTenant } from "../db/tenants.db.server";
import { getTenantSubscription } from "../db/tenantSubscriptions.db.server";
import { cancelStripeSubscription, deleteStripeCustomer } from "../stripe.server";

export async function deleteAndCancelTenant(id: string) {
  const tenantSubscription = await getTenantSubscription(id);
  if (tenantSubscription?.products) {
    await Promise.all(
      tenantSubscription.products.map(async (product) => {
        if (product?.stripeSubscriptionId) {
          await cancelStripeSubscription(product?.stripeSubscriptionId);
        }
      })
    );
  }
  if (tenantSubscription?.stripeCustomerId) {
    await deleteStripeCustomer(tenantSubscription?.stripeCustomerId);
  }
  return await deleteTenant(id);
}

export async function getAvailableTenantSlug({ name, slug }: { name: string; slug?: string }) {
  if (slug === undefined) {
    slug = UrlUtils.slugify(name);
  }
  let tries = 1;
  do {
    const existingSlug = await getExistingSlug(slug);
    if (existingSlug) {
      slug = UrlUtils.slugify(name) + tries.toString();
      tries++;
    } else {
      break;
    }
  } while (true);
  return slug;
}

export async function getExistingSlug(slug: string) {
  if (["new-account", "undefined", "null"].includes(slug)) {
    return true;
  }
  const existing = await db.tenant.count({
    where: {
      slug,
    },
  });
  return existing > 0;
}
