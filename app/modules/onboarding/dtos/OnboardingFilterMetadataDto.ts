import { Tenant, Entity, Role } from "@prisma/client";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { UserSimple } from "~/utils/db/users.db.server";

export interface OnboardingFilterMetadataDto {
  users: UserSimple[];
  tenants: Tenant[];
  entities: Entity[];
  subscriptionProducts: SubscriptionProductDto[];
  roles: Role[];
}
