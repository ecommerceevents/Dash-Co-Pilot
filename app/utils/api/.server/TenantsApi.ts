import { getTranslations } from "~/locale/i18next.server";
import { findEntityByName } from "../../db/entities/entities.db.server";
import { createTenant } from "../../db/tenants.db.server";
import { getUser, updateUserDefaultTenantId } from "../../db/users.db.server";
import { getUserInfo } from "../../session.server";
import { createStripeCustomer } from "../../stripe.server";
import { RowsApi } from "./RowsApi";
import { TenantTypesApi } from "./TenantTypesApi";
import EventsService from "../../../modules/events/services/.server/EventsService";
import { AccountCreatedDto } from "~/modules/events/dtos/AccountCreatedDto";
import { autosubscribeToTrialOrFreePlan } from "../../services/.server/pricingService";

export namespace TenantsApi {
  export async function create({ request, form, name, slug }: { request: Request; form: FormData; name: string; slug?: string }) {
    const { t } = await getTranslations(request);
    let userInfo = await getUserInfo(request);
    const user = await getUser(userInfo.userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (!name) {
      throw new Error("Name is required");
    }

    let stripeCustomerId: string | undefined;
    if (process.env.STRIPE_SK) {
      const stripeCustomer = await createStripeCustomer(user?.email, name);
      if (!stripeCustomer) {
        throw new Error("Could not create Stripe customer");
      }
      stripeCustomerId = stripeCustomer.id;
    }
    const tenant = await createTenant({ name, subscriptionCustomerId: stripeCustomerId, slug });

    await updateUserDefaultTenantId({ defaultTenantId: tenant.id }, user.id);

    await autosubscribeToTrialOrFreePlan({ request, t, tenantId: tenant.id, userId: user.id });

    await EventsService.create({
      request,
      event: "account.created",
      tenantId: tenant.id,
      userId: user.id,
      data: {
        tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
        user: { id: user.id, email: user.email },
      } satisfies AccountCreatedDto,
    });

    const tenantSettingsEntity = await findEntityByName({ tenantId: null, name: "tenantSettings" });
    if (tenantSettingsEntity) {
      try {
        await RowsApi.createCustom({
          request,
          entity: tenantSettingsEntity,
          tenantId: tenant.id,
          t,
          form,
          row: undefined,
        });
      } catch (e: any) {
        throw e;
      }
    }

    await TenantTypesApi.setTenantTypes({ tenantId: tenant.id });

    return {
      redirectTo: `/app/${encodeURIComponent(tenant.slug)}/dashboard`,
      tenant,
      user,
    };
  }
}
