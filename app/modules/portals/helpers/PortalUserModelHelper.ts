export const selectSimplePortalUserProperties = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  githubId: true,
  googleId: true,
  locale: true,
  createdAt: true,
};

const selectWithAvatar = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatar: true,
  phone: true,
  admin: true,
  defaultTenantId: true,
  createdAt: true,
  githubId: true,
  googleId: true,
  locale: true,
};

const includeSimpleCreatedByUser = {
  createdByUser: {
    select: selectSimplePortalUserProperties,
  },
};

const includeSimpleUser = {
  user: {
    select: selectSimplePortalUserProperties,
  },
};

export default {
  includeSimpleCreatedByUser,
  includeSimpleUser,
  selectSimplePortalUserProperties,
  selectWithAvatar,
};
