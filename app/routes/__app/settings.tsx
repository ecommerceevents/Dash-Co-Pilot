import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { getTranslations } from "~/locale/i18next.server";
import { AccountDeletedDto } from "~/modules/events/dtos/AccountDeletedDto";
import { UserPasswordUpdatedDto } from "~/modules/events/dtos/UserPasswordUpdatedDto";
import { UserProfileDeletedDto } from "~/modules/events/dtos/UserProfileDeletedDto";
import { UserProfileUpdatedDto } from "~/modules/events/dtos/UserProfileUpdatedDto";
import EventsService from "~/modules/events/services/.server/EventsService";
import FooterBlock from "~/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import HeaderBlock from "~/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import UserProfileSettings from "~/modules/users/components/UserProfileSettings";
import { db } from "~/utils/db.server";
import { UserWithoutPassword, getUser, updateUserPassword, updateUserProfile } from "~/utils/db/users.db.server";
import { storeSupabaseFile } from "~/utils/integrations/supabaseService";
import { deleteUserWithItsTenants } from "~/utils/services/userService";
import { getUserInfo } from "~/utils/session.server";
import bcrypt from "bcryptjs";
import { useEffect } from "react";
import toast from "react-hot-toast";
import Tabs from "~/components/ui/tabs/Tabs";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";

type LoaderData = {
  user: UserWithoutPassword;
};
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userInfo = await getUserInfo(request);
  const user = await getUser(userInfo?.userId);
  if (!user) {
    throw redirect("/login");
  }
  const appConfiguration = await getAppConfiguration({ request });
  if (appConfiguration.app.features.tenantHome !== "/") {
    throw redirect("/my-profile");
  }
  const data: LoaderData = {
    user,
  };
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
};
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);
  const userInfo = await getUserInfo(request);
  const form = await request.formData();
  const action = form.get("action");

  const firstName = form.get("firstName")?.toString();
  const lastName = form.get("lastName")?.toString();
  const avatar = form.get("avatar")?.toString() ?? "";

  const passwordCurrent = form.get("passwordCurrent")?.toString();
  const passwordNew = form.get("passwordNew")?.toString();
  const passwordNewConfirm = form.get("passwordNewConfirm")?.toString();

  if (typeof action !== "string") {
    return json({ error: `Form not submitted correctly.` }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: userInfo?.userId },
    include: {
      admin: true,
    },
  });
  if (!user) {
    return json({ error: `User not found.` }, { status: 400 });
  }
  switch (action) {
    case "profile": {
      const fields = { action, firstName, lastName, avatar, passwordCurrent, passwordNew, passwordNewConfirm };
      const fieldErrors = {
        firstName: action === "profile" && (fields.firstName ?? "").length < 2 ? "First name required" : "",
        lastName: action === "profile" && (fields.lastName ?? "").length < 2 ? "Last name required" : "",
      };
      if (Object.values(fieldErrors).some(Boolean)) {
        return json({ error: `Form not submitted correctly.`, fields: fieldErrors }, { status: 400 });
      }

      if (typeof firstName !== "string" || typeof lastName !== "string") {
        return json({ error: `Form not submitted correctly.` }, { status: 400 });
      }

      let avatarStored = avatar ? await storeSupabaseFile({ bucket: "users-icons", content: avatar, id: userInfo?.userId }) : avatar;
      const profile = await updateUserProfile({ firstName, lastName, avatar: avatarStored }, userInfo?.userId);
      if (!profile) {
        return json({ error: `Something went wrong.` }, { status: 400 });
      }
      await EventsService.create({
        request,
        event: "user.profile.updated",
        tenantId: null,
        userId: user.id,
        data: {
          email: user.email,
          new: { firstName, lastName },
          old: { firstName: user.firstName, lastName: user.lastName },
          userId: userInfo?.userId,
        } satisfies UserProfileUpdatedDto,
      });
      return json({ success: "Profile updated" });
    }
    case "password": {
      if (typeof passwordCurrent !== "string" || typeof passwordNew !== "string" || typeof passwordNewConfirm !== "string") {
        return json({ error: `Form not submitted correctly.` }, { status: 400 });
      }

      if (passwordNew !== passwordNewConfirm) {
        return json({ error: t("account.shared.passwordMismatch") }, { status: 400 });
      }

      if (passwordNew.length < 6) {
        return json(
          {
            error: `Passwords must have least 6 characters.`,
          },
          { status: 400 }
        );
      }

      if (!user) return null;

      const isCorrectPassword = await bcrypt.compare(passwordCurrent, user.passwordHash);
      if (!isCorrectPassword) {
        return json({ error: `Invalid password.` }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(passwordNew, 10);
      await updateUserPassword({ passwordHash }, userInfo?.userId);
      await EventsService.create({
        request,
        event: "user.password.updated",
        tenantId: null,
        userId: user.id,
        data: {
          user: { id: user.id, email: user.email },
        } satisfies UserPasswordUpdatedDto,
      });

      return json({
        passwordSuccess: "Password updated",
      });
    }
    case "deleteAccount": {
      if (!user) {
        return null;
      }
      if (user.admin !== null) {
        return json(
          {
            error: "Cannot delete an admin",
          },
          { status: 400 }
        );
      }

      try {
        const { deletedTenants } = await deleteUserWithItsTenants(user.id);
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
        return json(
          {
            error: e,
          },
          { status: 400 }
        );
      }

      return redirect("/login");
    }
  }
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success, {
        position: "bottom-right",
      });
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);
  return (
    <div>
      <HeaderBlock />
      <div className="mx-auto max-w-5xl space-y-5 px-4">
        <div className="border-b border-gray-200 pb-5">
          {/* <h3 className="text-xl font-semibold leading-6 text-gray-900">Settings</h3> */}
          <Tabs
            tabs={[
              { name: `Profile`, routePath: "/settings" },
              { name: `Subscription`, routePath: "/settings/subscription" },
            ]}
            exact
          />
        </div>
        <UserProfileSettings user={data.user} />
      </div>
      <FooterBlock />
    </div>
  );
}
