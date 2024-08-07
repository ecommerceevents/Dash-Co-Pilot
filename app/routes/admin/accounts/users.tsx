import { useTranslation } from "react-i18next";
import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { adminGetAllUsers, getUser, updateUserPassword, UserWithDetails } from "~/utils/db/users.db.server";
import { createUserSession, getUserInfo, setLoggedUser } from "~/utils/session.server";
import { getTranslations } from "~/locale/i18next.server";
import bcrypt from "bcryptjs";
import UsersTable from "~/components/core/users/UsersTable";
import { deleteUserWithItsTenants } from "~/utils/services/userService";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { useAdminData } from "~/utils/data/useAdminData";
import InputFilters from "~/components/ui/input/InputFilters";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import EventsService from "~/modules/events/services/.server/EventsService";
import { adminGetAllTenantsIdsAndNames, getTenant } from "~/utils/db/tenants.db.server";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { Log } from "@prisma/client";
import { getLastUserLog } from "~/utils/db/logs.db.server";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { useNavigate, useOutlet } from "@remix-run/react";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import { serverTimingHeaders } from "~/modules/metrics/utils/defaultHeaders.server";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { AccountDeletedDto } from "~/modules/events/dtos/AccountDeletedDto";
import { UserPasswordUpdatedDto } from "~/modules/events/dtos/UserPasswordUpdatedDto";
import { UserProfileDeletedDto } from "~/modules/events/dtos/UserProfileDeletedDto";
import { useEffect } from "react";
import toast from "react-hot-toast";
export { serverTimingHeaders as headers };

type LoaderData = {
  title: string;
  items: UserWithDetails[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
  lastLogs: { userId: string; log: Log }[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "admin.users");
  await time(verifyUserHasPermission(request, "admin.users.view"), "verifyUserHasPermission");
  let { t } = await time(getTranslations(request), "getTranslations");

  const filterableProperties: FilterablePropertyDto[] = [
    { name: "email", title: t("models.user.email") },
    { name: "firstName", title: t("models.user.firstName") },
    { name: "lastName", title: t("models.user.lastName") },
    {
      name: "tenantId",
      title: t("models.tenant.object"),
      manual: true,
      options: (await adminGetAllTenantsIdsAndNames()).map((tenant) => {
        return {
          value: tenant.id,
          name: tenant.name,
        };
      }),
    },
    {
      name: "lastLogin",
      title: "Has logged in",
      manual: true,
      options: [
        {
          value: "last-24-hours", // days
          name: t("app.shared.periods.LAST_24_HOURS"),
        },
        {
          value: "last-7-days", // days
          name: t("app.shared.periods.LAST_WEEK"),
        },
        {
          value: "last-30-days", // days
          name: t("app.shared.periods.LAST_30_DAYS"),
        },
        {
          value: "last-3-months", // months
          name: t("app.shared.periods.LAST_3_MONTHS"),
        },
        {
          value: "last-6-months", // months
          name: t("app.shared.periods.LAST_N_MONTHS", { 0: "6" }),
        },
        {
          value: "last-year", // months
          name: t("app.shared.periods.LAST_YEAR"),
        },
      ],
    },
    {
      name: "isAdmin",
      title: "Is admin",
      manual: true,
      isBoolean: true,
      hideSearch: true,
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await time(adminGetAllUsers(filters, currentPagination), "adminGetAllUsers");

  const lastLogs = (
    await time(
      Promise.all(
        items.map(async (user) => {
          const log = await getLastUserLog(user.id);
          return log ? { userId: user.id, log } : null;
        })
      ),
      "getLastUserLog"
    )
  )
    .filter((entry) => entry !== null)
    .map((entry) => entry as { userId: string; log: Log });

  const data: LoaderData = {
    title: `${t("models.user.plural")} | ${process.env.APP_NAME}`,
    items,
    filterableProperties,
    pagination,
    lastLogs,
  };
  return json(data, { headers: getServerTimingHeader() });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

type ActionData = {
  error?: string;
  success?: string;
};
const success = (data: ActionData) => json(data, { status: 200 });
const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action = async ({ request }: ActionFunctionArgs) => {
  const userInfo = await getUserInfo(request);
  const { t } = await getTranslations(request);

  const form = await request.formData();
  const action = form.get("action")?.toString();
  const userId = form.get("user-id")?.toString();
  const user = await getUser(userId);

  if (!userId || !user || !action) {
    return badRequest({ error: "Form not submitted correctly." });
  }
  switch (action) {
    case "impersonate": {
      const userSession = await setLoggedUser(user);
      if (!userSession) {
        return badRequest({
          error: t("shared.notFound"),
        });
      }
      const tenant = await getTenant(userSession.defaultTenantId);
      return createUserSession(
        {
          ...userInfo,
          ...userSession,
          impersonatingFromUserId: userInfo.userId,
        },
        tenant ? `/app/${tenant.slug ?? tenant.id}/dashboard` : "/app"
      );
    }
    case "change-password": {
      const passwordNew = form.get("password-new")?.toString();
      if (!passwordNew || passwordNew.length < 8) {
        return badRequest({ error: "Set a password with 8 characters minimum" });
      } else if (user?.admin) {
        return badRequest({ error: "You cannot change password for admin user" });
      }

      const passwordHash = await bcrypt.hash(passwordNew, 10);
      await updateUserPassword({ passwordHash }, user?.id);
      const currentUser = await getUser(userInfo.userId);
      await EventsService.create({
        request,
        event: "user.password.updated",
        tenantId: null,
        userId: user.id,
        data: {
          user: { id: user.id, email: user.email },
          fromUser: { id: currentUser?.id ?? "", email: currentUser?.email ?? "" },
        } satisfies UserPasswordUpdatedDto,
      });

      return success({ success: t("shared.updated") });
    }
    case "delete-user": {
      // TODO: CANCEL TENANTS SUBSCRIPTIONS, DELETE TENANTS AND SUBSCRIPTIONS
      try {
        const { deletedTenants } = await deleteUserWithItsTenants(userId);
        const deletedAccounts = await Promise.all(
          deletedTenants.map(async (tenant) => {
            const data = {
              tenant: { id: tenant.id, name: tenant.name },
              user: { id: user.id, email: user.email },
            } satisfies AccountDeletedDto;
            await EventsService.create({
              request,
              event: "account.deleted",
              tenantId: null,
              userId: null,
              data,
            });
            return data;
          })
        );
        await EventsService.create({
          request,
          event: "user.profile.deleted",
          tenantId: null,
          userId: null,
          data: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            deletedAccounts,
          } satisfies UserProfileDeletedDto,
        });
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.error(e);
        return badRequest({
          error: e,
        });
      }
      return success({ success: t("shared.deleted") });
    }
    default: {
      return badRequest({ error: "Form not submitted correctly." });
    }
  }
};

export default function AdminUsersRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const adminData = useAdminData();
  const outlet = useOutlet();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <EditPageLayout
      title={t("models.user.plural")}
      buttons={
        <>
          <InputFilters filters={data.filterableProperties} />
          <ButtonPrimary to="new">
            <span className="sm:text-sm">+</span>
          </ButtonPrimary>
        </>
      }
    >
      <UsersTable
        items={data.items}
        canImpersonate={getUserHasPermission(adminData, "admin.users.impersonate")}
        canChangePassword={getUserHasPermission(adminData, "admin.users.changePassword")}
        canDelete={getUserHasPermission(adminData, "admin.users.delete")}
        canSetUserRoles={adminData.isSuperAdmin}
        pagination={data.pagination}
        lastLogs={data.lastLogs}
      />

      <SlideOverWideEmpty
        open={!!outlet}
        onClose={() => {
          navigate(".", { replace: true });
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{outlet}</div>
        </div>
      </SlideOverWideEmpty>
    </EditPageLayout>
  );
}
