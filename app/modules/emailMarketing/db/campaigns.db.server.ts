import { Campaign, EmailSender, OutboundEmail, OutboundEmailClick, OutboundEmailOpen } from "@prisma/client";
import UserModelHelper from "~/utils/helpers/models/UserModelHelper";
import { db } from "~/utils/db.server";
import { RowWithValues } from "~/utils/db/entities/rows.db.server";

export type CampaignWithDetails = Campaign & {
  emailSender: EmailSender;
  recipients: (OutboundEmail & {
    campaign: Campaign | null;
    opens: OutboundEmailOpen[];
    clicks: OutboundEmailClick[];
    contactRow: RowWithValues | null;
  })[];
};
export async function getAllCampaigns(tenantId: string | null, status?: string): Promise<CampaignWithDetails[]> {
  return await db.campaign.findMany({
    where: {
      tenantId,
      status,
    },
    include: {
      emailSender: true,
      recipients: {
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
      },
    },
  });
}

export async function getCampaign(id: string, tenantId: string | null): Promise<CampaignWithDetails | null> {
  return await db.campaign.findFirst({
    where: {
      id,
      tenantId,
    },
    include: {
      emailSender: true,
      recipients: {
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
      },
    },
  });
}

export async function createCampaign(
  data: {
    emailSenderId: string;
    tenantId: string | null;
    name: string;
    subject: string;
    htmlBody: string;
    textBody: string | undefined;
    track: boolean;
  },
  recipients: { fromSenderId: string; email: string; contactRowId: string }[]
): Promise<Campaign> {
  const item = await db.campaign.create({
    data: {
      ...data,
      recipients: {
        create: recipients.map((recipient) => {
          return {
            tenantId: data.tenantId,
            contactRowId: recipient.contactRowId,
            email: recipient.email,
            fromSenderId: recipient.fromSenderId,
          };
        }),
      },
    },
  });

  return item;
}

export async function updateCampaign(
  id: string,
  data: {
    name?: string;
    subject?: string;
    htmlBody?: string;
    textBody?: string | undefined;
    status?: string;
    track?: boolean;
    sentAt?: Date;
  },
  recipients?: { fromSenderId: string; email: string; contactRowId: string }[]
): Promise<Campaign> {
  const item = await db.campaign.update({
    where: {
      id,
    },
    data,
  });
  if (recipients) {
    await db.outboundEmail.deleteMany({
      where: {
        campaignId: id,
      },
    });
    await db.outboundEmail.createMany({
      data: recipients.map((recipient) => {
        return {
          tenantId: item.tenantId,
          campaignId: id,
          contactRowId: recipient.contactRowId,
          email: recipient.email,
          fromSenderId: recipient.fromSenderId,
        };
      }),
    });
  }

  return item;
}

export async function deleteCampaign(id: string, tenantId: string | null) {
  return await db.campaign.deleteMany({
    where: {
      id,
      tenantId,
    },
  });
}

export async function groupCampaigns(tenantId: string | null) {
  return await db.campaign.groupBy({
    by: ["status"],
    where: {
      tenantId,
    },
    _count: {
      _all: true,
    },
  });
}
