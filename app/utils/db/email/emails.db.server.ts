import { Email, EmailAttachment, EmailCc, EmailRead, TenantInboundAddress } from "@prisma/client";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { db } from "~/utils/db.server";
import RowFiltersHelper from "~/utils/helpers/RowFiltersHelper";

export type EmailWithSimpleDetails = Email & {
  tenantInboundAddress?: (TenantInboundAddress & { tenant: { name: string } }) | null;
  cc: EmailCc[];
  _count: { attachments: number; reads: number };
};

export type EmailWithDetails = Email & {
  tenantInboundAddress?: TenantInboundAddress | null;
  cc: EmailCc[];
  reads: EmailRead[];
  attachments: EmailAttachment[];
};

export async function getAllEmails(
  type: string,
  pagination: { page: number; pageSize: number },
  filters?: FiltersDto,
  tenantId?: string | null
): Promise<{ items: EmailWithSimpleDetails[]; pagination: PaginationDto }> {
  const whereFilters = RowFiltersHelper.getFiltersCondition(filters);
  const where = tenantId ? { AND: [{ type }, { ...whereInboundAddress(tenantId) }, whereFilters] } : { AND: [{ type }, whereFilters] };
  const items = await db.email.findMany({
    take: pagination.pageSize,
    skip: pagination.pageSize * (pagination.page - 1),
    where,
    include: {
      tenantInboundAddress: {
        include: { tenant: { select: { name: true } } },
      },
      cc: true,
      _count: {
        select: {
          attachments: true,
          reads: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  const totalItems = await db.email.count({ where });

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

export function getEmail(id: string, tenantId?: string | null): Promise<EmailWithDetails | null> {
  const where = tenantId === null ? { id } : { id, ...whereInboundAddress(tenantId) };
  return db.email.findFirst({
    where,
    include: {
      tenantInboundAddress: true,
      cc: true,
      attachments: true,
      reads: true,
    },
  });
}

export function getEmailByMessageId(messageId: string): Promise<EmailWithDetails | null> {
  return db.email.findFirst({
    where: {
      messageId,
    },
    include: {
      tenantInboundAddress: true,
      cc: true,
      attachments: true,
      reads: true,
    },
  });
}

export function createEmail(data: {
  tenantInboundAddressId: string | null;
  messageId: any;
  type: string;
  date: Date;
  subject: any;
  fromEmail: any;
  fromName: any;
  toEmail: any;
  toName: any;
  textBody: any;
  htmlBody: any;
  cc: {
    create: any;
  };
  attachments?:
    | {
        create?: any;
      }
    | undefined;
}) {
  return db.email.create({
    data,
  });
}

export function getEmailReads(id: string, readByUserId: string): Promise<EmailRead[]> {
  return db.emailRead.findMany({
    where: {
      emailId: id,
      userId: readByUserId,
    },
  });
}

export function createEmailRead(emailId: string, userId: string): Promise<EmailRead> {
  return db.emailRead.create({
    data: {
      emailId,
      userId,
    },
  });
}

export function deleteEmail(id: string) {
  return db.email.delete({
    where: { id },
  });
}

function whereInboundAddress(tenantId?: string | null) {
  if (!tenantId) {
    return {
      tenantInboundAddress: {
        is: null,
      },
    };
  } else {
    return {
      tenantInboundAddress: {
        tenantId,
      },
    };
  }
}
