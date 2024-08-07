import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import UploadImage from "~/components/ui/uploaders/UploadImage";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useActionData, useSubmit, useNavigation, useLocation, useSearchParams } from "@remix-run/react";
import { updateUserPassword, updateUserProfile } from "~/utils/db/users.db.server";
import { getUserInfo } from "~/utils/session.server";
import UploadDocuments from "~/components/ui/uploaders/UploadDocument";
import { db } from "~/utils/db.server";
import bcrypt from "bcryptjs";
import { getTranslations } from "~/locale/i18next.server";
import { i18nConfig } from "~/locale/i18n";
import { useAdminData } from "~/utils/data/useAdminData";
import { deleteUserWithItsTenants } from "~/utils/services/userService";
import EventsService from "~/modules/events/services/.server/EventsService";
import { UserProfileUpdatedDto } from "~/modules/events/dtos/UserProfileUpdatedDto";
import { storeSupabaseFile } from "~/utils/integrations/supabaseService";

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

type LoaderData = {
  title: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const data: LoaderData = {
    title: `${t("settings.profile.profileTitle")} | ${process.env.APP_NAME}`,
  };
  return json(data);
};

type ActionData = {
  profileSuccess?: string;
  profileError?: string;
  passwordSuccess?: string;
  passwordError?: string;
  deleteError?: string;
  fieldErrors?: {
    firstName: string | undefined;
    lastName: string | undefined;
  };
  fields?: {
    action: string;
    firstName: string | undefined;
    lastName: string | undefined;
    avatar: string | undefined;
    passwordCurrent: string | undefined;
    passwordNew: string | undefined;
    passwordNewConfirm: string | undefined;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);

  const userInfo = await getUserInfo(request);
  const form = await request.formData();
  const action = form.get("action");

  const firstName = form.get("firstName")?.toString();
  const lastName = form.get("lastName")?.toString();
  const avatar = form.get("avatar")?.toString();

  const passwordCurrent = form.get("passwordCurrent")?.toString();
  const passwordNew = form.get("passwordNew")?.toString();
  const passwordNewConfirm = form.get("passwordNewConfirm")?.toString();

  if (typeof action !== "string") {
    return badRequest({
      profileError: `Form not submitted correctly.`,
    });
  }

  const user = await db.user.findUnique({
    where: { id: userInfo?.userId },
    include: { admin: true },
  });
  if (!user) {
    return badRequest({ profileError: `User not found.` });
  }

  switch (action) {
    case "profile": {
      const fields = { action, firstName, lastName, avatar, passwordCurrent, passwordNew, passwordNewConfirm };
      const fieldErrors = {
        firstName: action === "profile" && (fields.firstName ?? "").length < 2 ? "First name required" : "",
        lastName: action === "profile" && (fields.lastName ?? "").length < 2 ? "Last name required" : "",
      };
      if (Object.values(fieldErrors).some(Boolean)) return badRequest({ fieldErrors, fields });

      if (typeof firstName !== "string" || typeof lastName !== "string") {
        return badRequest({
          profileError: `Form not submitted correctly.`,
        });
      }

      if (user?.admin && user.id !== userInfo?.userId) {
        return badRequest({
          profileError: `Cannot update admin user.`,
        });
      }

      const avatarStored = avatar ? await storeSupabaseFile({ bucket: "users-icons", content: avatar, id: userInfo?.userId }) : avatar;
      const profile = await updateUserProfile({ firstName, lastName, avatar: avatarStored }, userInfo?.userId);

      if (!profile) {
        return badRequest({
          fields,
          profileError: `Could not update profile`,
        });
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
      return json({
        profileSuccess: "Profile updated",
      });
    }
    case "password": {
      if (typeof passwordCurrent !== "string" || typeof passwordNew !== "string" || typeof passwordNewConfirm !== "string") {
        return badRequest({
          passwordError: `Form not submitted correctly.`,
        });
      }

      if (passwordNew !== passwordNewConfirm) {
        return badRequest({
          passwordError: t("accounts.shared.passwordMismatch"),
        });
      }

      if (passwordNew.length < 6) {
        return badRequest({
          passwordError: `Passwords must have least 6 characters.`,
        });
      }

      if (!user) return null;

      if (user.admin && user.id !== userInfo?.userId) {
        return badRequest({
          passwordError: `Cannot change an admin password`,
        });
      }

      const isCorrectPassword = await bcrypt.compare(passwordCurrent, user.passwordHash);
      if (!isCorrectPassword) {
        return badRequest({
          passwordError: `Invalid password.`,
        });
      }

      const passwordHash = await bcrypt.hash(passwordNew, 10);
      await updateUserPassword({ passwordHash }, userInfo?.userId);

      return json({
        passwordSuccess: "Password updated",
      });
    }
    case "deleteAccount": {
      if (!user) {
        return null;
      }
      if (user.admin !== null) {
        return badRequest({
          deleteError: "Cannot delete an admin",
        });
      }

      try {
        await deleteUserWithItsTenants(user.id);
      } catch (e: any) {
        return badRequest({
          deleteError: e,
        });
      }

      // return redirect("/login");
    }
  }
};

export default function ProfileRoute() {
  const adminData = useAdminData();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const actionData = useActionData<ActionData>();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const submit = useSubmit();

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);
  const confirmModal = useRef<RefConfirmModal>(null);

  const inputFirstName = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputFirstName.current?.focus();
    inputFirstName.current?.select();
  }, []);

  const [avatar, setAvatar] = useState<string | undefined>(adminData.user?.avatar ?? undefined);
  const [showUploadImage, setShowUploadImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  function changedLocale(locale: string) {
    const form = new FormData();
    form.set("action", "setLocale");
    searchParams.set("lng", locale);
    form.set("redirect", location.pathname + "?" + searchParams.toString());
    form.set("lng", locale);
    submit(form, { method: "post", action: "/" });
  }

  function confirmDelete() {
    const form = new FormData();
    form.set("action", "deleteAccount");
    submit(form, { method: "post" });
  }
  function loadedImage(image: string | undefined) {
    setAvatar(image);
    setUploadingImage(true);
  }

  return (
    <div className="flex-1 overflow-x-auto xl:overflow-y-auto">
      <div className="mx-auto max-w-xl space-y-4 px-4 py-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("settings.admin.profile.title")}</h1>

        <div>
          {/*Profile */}
          <div className="grid gap-6">
            <div className="md:col-span-1">
              <div className="sm:px-0">
                <h3 className="text-foreground text-lg font-medium leading-6">{t("settings.profile.profileTitle")}</h3>
                <p className="mt-1 text-xs leading-5 text-gray-600">{t("settings.profile.profileText")}</p>
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <Form method="post">
                <input hidden type="text" name="action" value="profile" readOnly />
                <div className="">
                  <div className="">
                    <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-6 sm:col-span-6 md:col-span-6">
                        <label htmlFor="email_address" className="block text-sm font-medium leading-5 text-gray-700">
                          {t("account.shared.email")}
                        </label>
                        <input
                          required
                          disabled={true}
                          type="email"
                          id="email-address"
                          name="email"
                          defaultValue={adminData.user?.email}
                          className="focus:shadow-outline-blue form-input mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <label htmlFor="firstName" className="block text-sm font-medium leading-5 text-gray-700">
                          {t("settings.profile.firstName")}
                        </label>
                        <input
                          ref={inputFirstName}
                          id="firstName"
                          name="firstName"
                          required
                          defaultValue={adminData.user?.firstName}
                          aria-invalid={Boolean(actionData?.fieldErrors?.firstName)}
                          aria-errormessage={actionData?.fieldErrors?.firstName ? "firstName-error" : undefined}
                          className="focus:shadow-outline-blue form-input mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
                        />
                        {actionData?.fieldErrors?.firstName ? (
                          <p className="py-2 text-xs text-rose-500" role="alert" id="firstName-error">
                            {actionData.fieldErrors.firstName}
                          </p>
                        ) : null}
                      </div>

                      <div className="col-span-6 md:col-span-3">
                        <label htmlFor="lastName" className="block text-sm font-medium leading-5 text-gray-700">
                          {t("settings.profile.lastName")}
                        </label>
                        <input
                          id="lastName"
                          name="lastName"
                          defaultValue={adminData.user?.lastName}
                          aria-invalid={Boolean(actionData?.fieldErrors?.lastName)}
                          aria-errormessage={actionData?.fieldErrors?.lastName ? "lastName-error" : undefined}
                          className="focus:shadow-outline-blue form-input mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
                        />
                        {actionData?.fieldErrors?.lastName ? (
                          <p className="py-2 text-xs text-rose-500" role="alert" id="lastName-error">
                            {actionData.fieldErrors.lastName}
                          </p>
                        ) : null}
                      </div>

                      <div className="col-span-6 sm:col-span-6">
                        <label htmlFor="avatar" className="block text-sm font-medium leading-5 text-gray-700">
                          {t("shared.avatar")}
                        </label>
                        <div className="mt-2 flex items-center space-x-3">
                          <input hidden id="avatar" name="avatar" defaultValue={avatar ?? actionData?.fields?.avatar} />
                          <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-100">
                            {(() => {
                              if (avatar) {
                                return <img id="avatar" alt="Avatar" src={avatar} />;
                              } else {
                                return (
                                  <svg id="avatar" className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                );
                              }
                            })()}
                          </div>

                          {avatar ? (
                            <ButtonTertiary destructive={true} onClick={() => loadedImage("")} type="button">
                              {t("shared.delete")}
                            </ButtonTertiary>
                          ) : (
                            <UploadDocuments accept="image/png, image/jpg, image/jpeg" description="" className="h-12" onDropped={loadedImage} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-border mt-3 border-t pt-3">
                    <div className="flex justify-between">
                      <div id="form-success-message" className="flex items-center space-x-2">
                        {actionData?.profileSuccess ? (
                          <>
                            <p className="py-2 text-sm text-teal-500" role="alert">
                              {actionData.profileSuccess}
                            </p>
                          </>
                        ) : actionData?.profileError ? (
                          <p className="py-2 text-sm text-red-500" role="alert">
                            {actionData?.profileError}
                          </p>
                        ) : null}
                      </div>
                      <button
                        disabled={navigation.state === "submitting"}
                        type="submit"
                        className="bg-primary hover:bg-primary/90 focus:ring-primary inline-flex items-center space-x-2 rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                      >
                        {t("shared.save")}
                      </button>
                    </div>
                  </div>
                </div>
              </Form>
            </div>
          </div>

          {/*Separator */}
          <div className="block">
            <div className="py-5">{/* <div className="border-t border-border"></div> */}</div>
          </div>

          {/*Security */}
          <div className="grid gap-6">
            <div className="md:col-span-1">
              <div className="sm:px-0">
                <h3 className="text-foreground text-lg font-medium leading-6">{t("settings.profile.securityTitle")}</h3>
                <p className="mt-1 text-xs leading-5 text-gray-600">
                  {t("account.login.forgot")}{" "}
                  <a className="text-theme-600 hover:text-theme-500 font-bold" href={"/forgot-password?e=" + adminData.user?.email || ""}>
                    {t("account.reset.button")}
                  </a>
                </p>
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <Form method="post">
                <input hidden type="text" name="action" value="password" readOnly />
                <div className="">
                  <div>
                    <div className="">
                      <div className="grid grid-cols-6 gap-2">
                        <div className="col-span-6 sm:col-span-6">
                          <label htmlFor="passwordCurrent" className="block text-sm font-medium leading-5 text-gray-700">
                            {t("settings.profile.passwordCurrent")}
                          </label>
                          <input
                            required
                            type="password"
                            id="passwordCurrent"
                            name="passwordCurrent"
                            className="focus:shadow-outline-blue form-input mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
                          />
                        </div>
                        <div className="col-span-6 md:col-span-3">
                          <label htmlFor="password" className="block text-sm font-medium leading-5 text-gray-700">
                            {t("settings.profile.password")}
                          </label>
                          <input
                            required
                            type="password"
                            id="passwordNew"
                            name="passwordNew"
                            className="focus:shadow-outline-blue form-input mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
                          />
                        </div>

                        <div className="col-span-6 md:col-span-3">
                          <label htmlFor="passwordConfirm" className="block text-sm font-medium leading-5 text-gray-700">
                            {t("settings.profile.passwordConfirm")}
                          </label>
                          <input
                            required
                            type="password"
                            id="passwordNewConfirm"
                            name="passwordNewConfirm"
                            className="focus:shadow-outline-blue form-input mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="border-border mt-3 border-t pt-3">
                      <div className="flex justify-between space-x-2">
                        <div id="form-success-message" className="flex items-center space-x-2">
                          {actionData?.passwordSuccess ? (
                            <p className="py-2 text-sm text-teal-500" role="alert">
                              {actionData.passwordSuccess}
                            </p>
                          ) : actionData?.passwordError ? (
                            <p className="py-2 text-sm text-red-500" role="alert">
                              {actionData?.passwordError}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="submit"
                          className="bg-primary hover:bg-primary/90 focus:ring-primary inline-flex items-center space-x-2 rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                        >
                          {t("shared.save")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Form>
            </div>
          </div>

          {/*Separator */}
          <div className="block">
            <div className="py-5">{/* <div className="border-t border-border"></div> */}</div>
          </div>

          {/*Preferences */}
          <div className="grid gap-6">
            <div className="md:col-span-1">
              <div className="sm:px-0">
                <h3 className="text-foreground text-lg font-medium leading-6">{t("settings.preferences.title")}</h3>
                <p className="mt-1 text-xs leading-5 text-gray-600">{t("settings.preferences.description")}</p>
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <div className="">
                <div className="">
                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-6 sm:col-span-6">
                      <label htmlFor="locale" className="block text-sm font-medium leading-5 text-gray-700">
                        {t("settings.preferences.language")}
                      </label>
                      <select
                        id="locale"
                        required
                        value={i18n.language}
                        onChange={(e) => changedLocale(e.currentTarget.value)}
                        className="focus:border-theme-500 focus:ring-theme-500 mt-1 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm"
                      >
                        {i18nConfig.supportedLngs.map((locale, idx) => {
                          return (
                            <option key={idx} value={locale}>
                              {t("shared.locales." + locale)}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/*Separator */}
          <div className="block">
            <div className="py-5">{/* <div className="border-t border-border"></div> */}</div>
          </div>
        </div>

        {showUploadImage && !uploadingImage && (
          <UploadImage onClose={() => setShowUploadImage(false)} title={t("shared.avatar")} initialImage={avatar} onLoaded={loadedImage} />
        )}
        <SuccessModal ref={successModal} />
        <ErrorModal ref={errorModal} />
        <ConfirmModal ref={confirmModal} onYes={confirmDelete} />
      </div>
    </div>
  );
}
