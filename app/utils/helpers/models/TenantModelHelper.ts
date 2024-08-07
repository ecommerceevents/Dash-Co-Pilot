import RowModelHelper from "./RowModelHelper";
import TenantSubscriptionProductModelHelper from "./TenantSubscriptionProductModelHelper";
import UserModelHelper from "./UserModelHelper";

const selectSimpleTenantProperties = {
  id: true,
  name: true,
  slug: true,
  icon: true,
  deactivatedReason: true,
  types: true,
  active: true,
};

const includeTenantWithDetails = {
  inboundAddresses: true,
  users: {
    include: {
      ...UserModelHelper.includeSimpleUser,
    },
  },
  subscription: {
    include: {
      products: {
        include: { ...TenantSubscriptionProductModelHelper.includeTenantSubscriptionProductDetails },
      },
    },
  },
  tenantSettingsRow: { include: { row: { include: RowModelHelper.includeRowDetails } } },
  types: true,
};

const includeTenantWithUsage = {
  inboundAddresses: true,
  users: {
    include: {
      ...UserModelHelper.includeSimpleUser,
    },
  },
  subscription: {
    include: {
      products: { include: { ...TenantSubscriptionProductModelHelper.includeTenantSubscriptionProductDetails } },
    },
  },
  tenantSettingsRow: { include: { row: { include: RowModelHelper.includeRowDetails } } },
  types: true,
  _count: true,
};

export default {
  selectSimpleTenantProperties,
  includeTenantWithDetails,
  includeTenantWithUsage,
};
