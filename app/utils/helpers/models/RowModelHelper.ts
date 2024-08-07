import UserModelHelper from "./UserModelHelper";

const includeParentRows = {
  parent: {
    include: {
      createdByUser: { select: UserModelHelper.selectSimpleUserProperties },
      createdByApiKey: true,
      values: { include: { media: true, multiple: true, range: true } },
    },
  },
};
const includeChildRowsNested = {
  child: {
    include: {
      createdByUser: { select: UserModelHelper.selectSimpleUserProperties },
      createdByApiKey: true,
      values: { include: { media: true, multiple: true, range: true } },
      parentRows: {
        include: {
          parent: {
            include: {
              values: { include: { media: true, multiple: true, range: true } },
            },
          },
        },
      },
      childRows: {
        include: {
          child: {
            include: {
              values: { include: { media: true, multiple: true, range: true } },
            },
          },
        },
      },
    },
  },
};
const includeRowDetails = {
  ...UserModelHelper.includeSimpleCreatedByUser,
  createdByApiKey: true,
  tenant: true,
  values: { include: { media: true, multiple: true, range: true } },
  tags: { include: { tag: true } },
  parentRows: {
    include: includeParentRows,
  },
  childRows: {
    include: includeChildRowsNested,
  },
  permissions: true,
  sampleCustomEntity: true,
  integrationRows: true,
};

const includeParentRowsNested = {
  parent: {
    include: {
      createdByUser: { select: UserModelHelper.selectSimpleUserProperties },
      createdByApiKey: true,
      values: { include: { media: true, multiple: true, range: true } },
      parentRows: {
        include: {
          parent: {
            include: {
              values: { include: { media: true, multiple: true, range: true } },
            },
          },
        },
      },
      childRows: {
        include: {
          child: {
            include: {
              values: { include: { media: true, multiple: true, range: true } },
            },
          },
        },
      },
    },
  },
};
const includeRowDetailsNested = {
  ...UserModelHelper.includeSimpleCreatedByUser,
  createdByApiKey: true,
  tenant: true,
  values: { include: { media: true, multiple: true, range: true } },
  tags: { include: { tag: true } },
  parentRows: {
    include: includeParentRowsNested,
  },
  childRows: {
    include: includeChildRowsNested,
  },
  permissions: true,
  sampleCustomEntity: true,
  integrationRows: true,
};

export default {
  includeRowDetails,
  includeRowDetailsNested,
};
