import { Prisma, Portal } from "@prisma/client";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { JsonPropertiesValuesDto } from "~/modules/jsonProperties/dtos/JsonPropertiesValuesDto";
import { cachified, clearCacheKey } from "~/utils/cache.server";
import { db } from "~/utils/db.server";
import { TenantSimple } from "~/utils/db/tenants.db.server";
import TenantModelHelper from "~/utils/helpers/models/TenantModelHelper";

export type PortalWithDetails = Portal & {
  tenant: TenantSimple | null;
};

export type PortalWithCount = PortalWithDetails & {
  _count: {
    users: number;
    subscriptionProducts: number;
  };
};

export async function getAllPortals({
  tenantId,
  filters,
  filterableProperties,
  pagination,
}: {
  tenantId?: string | null;
  filters: FiltersDto;
  filterableProperties: FilterablePropertyDto[];
  pagination: { pageSize: number; page: number };
}): Promise<{
  items: PortalWithCount[];
  pagination: PaginationDto;
}> {
  const q = filters.query || "";

  const AND_filters: Prisma.PortalWhereInput[] = [];
  filterableProperties.forEach((filter) => {
    const value = filters.properties.find((f) => f.name === filter.name)?.value;
    if (value) {
      AND_filters.push({
        [filter.name]: value === "null" ? null : value,
      });
    }
  });

  const OR_filters: Prisma.PortalWhereInput[] = [];
  if (q) {
    OR_filters.push(
      { subdomain: { contains: q, mode: "insensitive" } },
      { domain: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } }
    );
  }

  const whereFilters: Prisma.PortalWhereInput = {};
  if (OR_filters.length > 0) {
    whereFilters.OR = OR_filters;
  }
  if (AND_filters.length > 0) {
    whereFilters.AND = AND_filters;
  }

  const items = await db.portal.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    where: whereFilters,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
      _count: {
        select: {
          users: true,
          subscriptionProducts: true,
        },
      },
    },
  });
  const totalItems = await db.portal.count();
  return {
    items,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
    },
  };
}

export async function getAllTenantPortals({ tenantId }: { tenantId: string | null }): Promise<PortalWithCount[]> {
  return await db.portal.findMany({
    where: {
      tenantId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
      _count: {
        select: {
          users: true,
          subscriptionProducts: true,
        },
      },
    },
  });
}

export async function getPortalById(tenantId: string | null, id: string): Promise<PortalWithDetails | null> {
  return await db.portal
    .findFirstOrThrow({
      where: {
        tenantId,
        OR: [{ id }, { subdomain: id }],
      },
      include: {
        tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
      },
    })
    .catch(() => null);
}

export async function getPortalBySubdomain(subdomain: string): Promise<PortalWithDetails | null> {
  return await cachified({
    key: `portalBySubdomain:${subdomain}`,
    ttl: 60 * 60 * 24,
    getFreshValue: async () => {
      return db.portal.findUnique({
        where: { subdomain },
        include: {
          tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
        },
      });
    },
  });
}

export async function getPortalByDomain(domain: string): Promise<PortalWithDetails | null> {
  return await cachified({
    key: `portalByDomain:${domain}`,
    ttl: 60 * 60 * 24,
    getFreshValue: async () => {
      return db.portal.findUnique({
        where: { domain },
        include: {
          tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
        },
      });
    },
  });
}

export async function createPortal(data: {
  tenantId: string | null;
  userId: string;
  subdomain: string;
  domain: string | null;
  title: string;
  isPublished: boolean;
  stripeAccountId: string | null;
  metadata: JsonPropertiesValuesDto;
  themeColor: string | null;
  themeScheme: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoImage: string | null;
  seoThumbnail: string | null;
  seoTwitterCreator: string | null;
  seoTwitterSite: string | null;
  seoKeywords: string | null;
  authRequireEmailVerification: boolean;
  authRequireOrganization: boolean;
  authRequireName: boolean;
  analyticsSimpleAnalytics: boolean;
  analyticsPlausibleAnalytics: boolean;
  analyticsGoogleAnalyticsTrackingId: string | null;
  brandingLogo: string | null;
  brandingLogoDarkMode: string | null;
  brandingIcon: string | null;
  brandingIconDarkMode: string | null;
  brandingFavicon: string | null;
  affiliatesRewardfulApiKey: string | null;
  affiliatesRewardfulUrl: string | null;
}) {
  return await db.portal
    .create({
      data: {
        tenantId: data.tenantId,
        createdByUserId: data.userId,
        subdomain: data.subdomain,
        domain: data.domain,
        title: data.title,
        isPublished: data.isPublished,
        stripeAccountId: data.stripeAccountId,
        metadata: data.metadata,
        themeColor: data.themeColor,
        themeScheme: data.themeScheme,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoImage: data.seoImage,
        seoThumbnail: data.seoThumbnail,
        seoTwitterCreator: data.seoTwitterCreator,
        seoTwitterSite: data.seoTwitterSite,
        seoKeywords: data.seoKeywords,
        authRequireEmailVerification: data.authRequireEmailVerification,
        authRequireOrganization: data.authRequireOrganization,
        authRequireName: data.authRequireName,
        analyticsSimpleAnalytics: data.analyticsSimpleAnalytics,
        analyticsPlausibleAnalytics: data.analyticsPlausibleAnalytics,
        analyticsGoogleAnalyticsTrackingId: data.analyticsGoogleAnalyticsTrackingId,
        brandingLogo: data.brandingLogo,
        brandingLogoDarkMode: data.brandingLogoDarkMode,
        brandingIcon: data.brandingIcon,
        brandingIconDarkMode: data.brandingIconDarkMode,
        brandingFavicon: data.brandingFavicon,
        affiliatesRewardfulApiKey: data.affiliatesRewardfulApiKey,
        affiliatesRewardfulUrl: data.affiliatesRewardfulUrl,
      },
    })
    .then((item) => {
      clearCacheKey(`portalBySubdomain:${item.subdomain}`);
      clearCacheKey(`portalByDomain:${item.domain}`);
      return item;
    });
}

export async function updatePortal(
  before: Portal,
  data: {
    subdomain?: string;
    domain?: string | null;
    title?: string;
    isPublished?: boolean;
    stripeAccountId?: string | null;
    metadata?: JsonPropertiesValuesDto;
    themeColor?: string | null;
    themeScheme?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoImage?: string | null;
    seoThumbnail?: string | null;
    seoTwitterCreator?: string | null;
    seoTwitterSite?: string | null;
    seoKeywords?: string | null;
    authRequireEmailVerification?: boolean;
    authRequireOrganization?: boolean;
    authRequireName?: boolean;
    analyticsSimpleAnalytics?: boolean;
    analyticsPlausibleAnalytics?: boolean;
    analyticsGoogleAnalyticsTrackingId?: string | null;
    brandingLogo?: string | null;
    brandingLogoDarkMode?: string | null;
    brandingIcon?: string | null;
    brandingIconDarkMode?: string | null;
    brandingFavicon?: string | null;
    affiliatesRewardfulApiKey?: string | null;
    affiliatesRewardfulUrl?: string | null;
  }
) {
  return await db.portal
    .update({
      where: { id: before.id },
      data: {
        subdomain: data.subdomain,
        domain: data.domain,
        title: data.title,
        isPublished: data.isPublished,
        stripeAccountId: data.stripeAccountId,
        metadata: data.metadata,
        themeColor: data.themeColor,
        themeScheme: data.themeScheme,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoImage: data.seoImage,
        seoThumbnail: data.seoThumbnail,
        seoTwitterCreator: data.seoTwitterCreator,
        seoTwitterSite: data.seoTwitterSite,
        seoKeywords: data.seoKeywords,
        authRequireEmailVerification: data.authRequireEmailVerification,
        authRequireOrganization: data.authRequireOrganization,
        authRequireName: data.authRequireName,
        analyticsSimpleAnalytics: data.analyticsSimpleAnalytics,
        analyticsPlausibleAnalytics: data.analyticsPlausibleAnalytics,
        analyticsGoogleAnalyticsTrackingId: data.analyticsGoogleAnalyticsTrackingId,
        brandingLogo: data.brandingLogo,
        brandingLogoDarkMode: data.brandingLogoDarkMode,
        brandingIcon: data.brandingIcon,
        brandingIconDarkMode: data.brandingIconDarkMode,
        brandingFavicon: data.brandingFavicon,
        affiliatesRewardfulApiKey: data.affiliatesRewardfulApiKey,
        affiliatesRewardfulUrl: data.affiliatesRewardfulUrl,
      },
    })
    .then((item) => {
      clearCacheKey(`portalBySubdomain:${before.subdomain}`);
      clearCacheKey(`portalBySubdomain:${item.subdomain}`);
      clearCacheKey(`portalByDomain:${item.domain}`);

      if (process.env.PORTAL_SERVER_URL) {
        // post there with subdomain and domain in the body calling /api/cache/clear
        fetch(`${process.env.PORTAL_SERVER_URL}/api/cache`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subdomain: item.subdomain,
            domain: item.domain,
          }),
        })
          .then(async (response) => {
            // eslint-disable-next-line no-console
            console.log("Clearing portal cache succeeded", await response.json());
          })
          .catch(async (response) => {
            // eslint-disable-next-line no-console
            console.error("Clearing portal cache failed", response);
          });
      }
      return item;
    });
}

export async function deletePortal(id: string) {
  return await db.portal
    .delete({
      where: { id },
    })
    .then(async (item) => {
      clearCacheKey(`portalBySubdomain:${item.subdomain}`);
      clearCacheKey(`portalByDomain:${item.domain}`);
      await db.analyticsUniqueVisitor.deleteMany({ where: { portalId: id } }).catch((e) => null);
      await db.analyticsPageView.deleteMany({ where: { portalId: id } }).catch((e) => null);
      await db.analyticsEvent.deleteMany({ where: { portalId: id } }).catch((e) => null);
      return item;
    });
}

export async function countPortals(): Promise<number> {
  return await db.portalUser.count({});
}
