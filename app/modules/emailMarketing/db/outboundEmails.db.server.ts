import { Campaign, OutboundEmail, OutboundEmailClick, OutboundEmailOpen, Prisma } from "@prisma/client";
import Constants from "~/application/Constants";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import UserModelHelper from "~/utils/helpers/models/UserModelHelper";
import { db } from "~/utils/db.server";
import { RowWithValues } from "~/utils/db/entities/rows.db.server";

export type OutboundEmailWithDetails = OutboundEmail & {
  campaign: Campaign | null;
  opens: OutboundEmailOpen[];
  clicks: OutboundEmailClick[];
  contactRow: RowWithValues | null;
};

export async function getAllOutboundEmails(
  tenantId: string | null,
  options: {
    where?: Prisma.OutboundEmailWhereInput;
    pagination: { page: number; pageSize: number };
  }
): Promise<{ items: OutboundEmailWithDetails[]; pagination: PaginationDto }> {
  const items = await db.outboundEmail.findMany({
    take: options.pagination.pageSize,
    skip: options.pagination.pageSize * (options.pagination.page - 1),
    where: {
      tenantId,
      ...options.where,
    },
    include: {
      campaign: true,
      opens: true,
      clicks: true,
      contactRow: {
        include: {
          createdByUser: { select: UserModelHelper.selectSimpleUserProperties },
          createdByApiKey: true,
          values: { include: { media: true, multiple: true, range: true } },
        },
      },
    },
    orderBy: [{ sentAt: "desc" }],
  });
  const totalItems = await db.outboundEmail.count({
    where: {
      tenantId,
      ...options.where,
    },
  });
  return {
    items,
    pagination: {
      page: options.pagination?.page ?? 1,
      pageSize: options.pagination.pageSize ?? Constants.DEFAULT_PAGE_SIZE,
      totalItems,
      totalPages: Math.ceil(totalItems / (options.pagination?.pageSize ?? Constants.DEFAULT_PAGE_SIZE)),
    },
  };
}

export async function findOutboundEmails(
  tenantId: string | null,
  options: {
    where?: Prisma.OutboundEmailWhereInput;
  }
) {
  return await db.outboundEmail.findMany({
    where: {
      tenantId,
      ...options.where,
    },
    include: {
      campaign: true,
      opens: true,
      clicks: true,
      contactRow: {
        include: {
          createdByUser: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, githubId: true, googleId: true } },
          values: { include: { media: true } },
        },
      },
    },
    orderBy: [{ sentAt: "desc" }],
  });
}

export async function getOutboundEmail(id: string) {
  return await db.outboundEmail.findFirst({
    where: {
      id,
    },
    include: {
      campaign: true,
      opens: true,
      clicks: true,
    },
  });
}

export async function createOutboundEmailTest(data: {
  tenantId: string | null;
  contactRowId?: string;
  email: string;
  fromSenderId: string;
}): Promise<OutboundEmail> {
  const item = await db.outboundEmail.create({
    data: {
      ...data,
      isPreview: true,
    },
  });
  return item;
}

export async function createOutboundEmail(data: {
  tenantId: string | null;
  contactRowId: string;
  email: string;
  fromSenderId: string;
  campaignId?: string;
}): Promise<OutboundEmail> {
  const item = await db.outboundEmail.create({
    data,
  });
  return item;
}

export async function updateOutboundEmail(
  id: string,
  data: {
    error?: string;
    sentAt?: Date;
    deliveredAt?: Date;
    bouncedAt?: Date;
    spamComplainedAt?: Date;
    unsubscribedAt?: Date;
  }
) {
  const item = await db.outboundEmail.update({
    where: {
      id,
    },
    data,
  });

  return item;
}

export async function openedOutboundEmail(outboundEmailId: string, data: { firstOpen: boolean }) {
  const item = await db.outboundEmailOpen.create({
    data: {
      outboundEmailId,
      firstOpen: data.firstOpen,
    },
  });

  return item;
}

export async function clickedOutboundEmail(
  outboundEmailId: string,
  data: {
    link: string;
  }
) {
  const item = await db.outboundEmailClick.create({
    data: {
      outboundEmailId,
      link: data.link,
    },
  });

  return item;
}

export async function unsubscribeCampaignRecipient(
  id: string,
  data: {
    unsubscribedAt: Date;
  }
) {
  const item = await db.outboundEmail.update({
    where: {
      id,
    },
    data,
  });

  return item;
}

export async function countOutboundEmails(
  tenantId: string | null,
  options?: {
    where: Prisma.OutboundEmailWhereInput;
  }
): Promise<number> {
  return await db.outboundEmail.count({
    where: {
      tenantId,
      ...options?.where,
    },
  });
}
