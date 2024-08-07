import { ActionFunction, json, LoaderFunctionArgs, redirect, MetaFunction } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import { getTenant, getTenantMember } from "~/utils/db/tenants.db.server";
import { getUser, getUserByEmail } from "~/utils/db/users.db.server";
import { createUserInvitation } from "~/utils/db/tenantUserInvitations.db.server";
import { sendEmail } from "~/utils/email.server";
import NewMember from "~/components/core/settings/members/NewMember";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";
import { getPlanFeatureUsage } from "~/utils/services/.server/subscriptionService";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { DefaultFeatures } from "~/application/dtos/shared/DefaultFeatures";
import { getBaseURL } from "~/utils/url.server";
import { useTypedLoaderData } from "remix-typedjson";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import ServerError from "~/components/ui/errors/ServerError";
import EventsService from "~/modules/events/services/.server/EventsService";
import { MemberInvitationCreatedDto } from "~/modules/events/dtos/MemberInvitationCreatedDto";
import { getUserInfo } from "~/utils/session.server";

export type NewMemberLoaderData = {
  title: string;
  featurePlanUsage: PlanFeatureUsageDto | undefined;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdFromUrl(params);
  await verifyUserHasPermission(request, "app.settings.members.create", tenantId);
  const featurePlanUsage = await getPlanFeatureUsage(tenantId, DefaultFeatures.Users);
  const data: NewMemberLoaderData = {
    title: `${t("settings.members.actions.new")} | ${process.env.APP_NAME}`,
    featurePlanUsage,
  };
  return json(data);
};

export type NewMemberActionData = {
  error?: string;
  success?: string;
  fields?: {
    email: string;
    firstName: string;
    lastName: string;
    role: number;
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  const tenantId = await getTenantIdFromUrl(params);
  const { userId } = await getUserInfo(request);

  const fromUser = await getUser(userId);
  const tenant = await getTenant(tenantId);
  if (!tenant || !fromUser) {
    return json({ error: "Could not find tenant or user" });
  }

  const form = await request.formData();

  const email = form.get("email")?.toString().toLowerCase().trim() ?? "";
  const firstName = form.get("first-name")?.toString() ?? "";
  const lastName = form.get("last-name")?.toString() ?? "";
  const sendInvitationEmail = Boolean(form.get("send-invitation-email"));

  try {
    const user = await getUserByEmail(email);
    if (user) {
      const tenantUser = await getTenantMember(user.id, tenantId);
      if (tenantUser) {
        return json({ error: "User already in organization" });
      }
    }

    const invitation = await createUserInvitation(tenantId, {
      email,
      firstName,
      lastName,
      type: TenantUserType.MEMBER,
      fromUserId: fromUser?.id ?? null,
    });
    if (!invitation) {
      return json({
        error: "Could not create invitation",
      });
    }

    await EventsService.create({
      request,
      event: "member.invitation.created",
      tenantId: tenant.id,
      userId: fromUser.id,
      data: {
        user: { email: invitation.email, firstName: invitation.firstName, lastName: invitation.lastName, type: TenantUserType[invitation.type] },
        tenant: { id: tenant.id, name: tenant.name },
        fromUser: { id: fromUser!.id, email: fromUser!.email },
      } satisfies MemberInvitationCreatedDto,
    });

    if (sendInvitationEmail) {
      await sendEmail({
        request,
        to: email,
        alias: "user-invitation",
        data: {
          name: firstName,
          invite_sender_name: fromUser.firstName,
          invite_sender_organization: tenant.name,
          action_url: getBaseURL(request) + `/invitation/${invitation.id}`,
        },
      });
    }

    return redirect(`/app/${params.tenant}/settings/members`);
  } catch (e: any) {
    return json({ error: e.error });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function NewMemberRoute() {
  const data = useTypedLoaderData<NewMemberLoaderData>();
  return <NewMember featurePlanUsage={data.featurePlanUsage} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
