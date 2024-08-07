export const selectSimpleUserProperties = {
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
    select: selectSimpleUserProperties,
  },
};

const includeSimpleUser = {
  user: {
    select: selectSimpleUserProperties,
  },
};

export default {
  includeSimpleCreatedByUser,
  includeSimpleUser,
  selectSimpleUserProperties,
  selectWithAvatar,
};
