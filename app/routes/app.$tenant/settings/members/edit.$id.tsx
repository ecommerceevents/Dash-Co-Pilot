import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import { useEscapeKeypress } from "~/utils/shared/KeypressUtils";
import { TenantUser, User } from "@prisma/client";
import { ActionFunction, DataFunctionArgs, json, MetaFunction, redirect } from "@remix-run/node";
import { Form, useActionData, useParams, useSubmit, useNavigation, useNavigate } from "@remix-run/react";
import { deleteTenantUser, getTenantUser } from "~/utils/db/tenants.db.server";
import { getTranslations } from "~/locale/i18next.server";
import clsx from "clsx";
import { useAppData } from "~/utils/data/useAppData";
import UrlUtils from "~/utils/app/UrlUtils";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import InputText from "~/components/ui/input/InputText";
import { useTypedLoaderData } from "remix-typedjson";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";

type LoaderData = {
  metatags: MetaTagsDto;
  member: (TenantUser & { user: User }) | null;
};

export const loader = async ({ request, params }: DataFunctionArgs) => {
  const { t } = await getTranslations(request);

  const member = await getTenantUser(params.id);
  const data: LoaderData = {
    metatags: [{ title: `${t("settings.members.actions.edit")} | ${process.env.APP_NAME}` }],
    member,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
  fields?: {
    email: string;
    firstName: string;
    lastName: string;
    role: number;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });
export const action: ActionFunction = async ({ request, params }) => {
  const { t } = await getTranslations(request);
  // const tenantId = await getTenantIdFromUrl(params);

  const { id } = params;
  if (!id) {
    return badRequest({
      error: t("shared.notFound"),
    });
  }
  const form = await request.formData();
  const action = form.get("action")?.toString();
  // const email = form.get("email")?.toString().toLowerCase().trim();
  // const firstName = form.get("firstName")?.toString() ?? "";
  // const lastName = Number(form.get("lastName")) ?? "";

  // const tenantUsers = await getTenantUsers(tenantId);
  // const owners = tenantUsers?.filter((f) => f.type === TenantUserType.OWNER);
  // if (owners?.length === 1 && owners?.find((f) => f.user.email === email) && type !== TenantUserType.OWNER) {
  //   return badRequest({
  //     error: t("api.errors.cannotBeWithoutOwner"),
  //   });
  // }

  if (action === "edit") {
    const tenantUser = await getTenantUser(id);
    if (!tenantUser) {
      return badRequest({
        error: t("shared.notFound"),
      });
    }
    // await updateTenantUser(id, { type });

    return redirect(UrlUtils.currentTenantUrl(params, "settings/members"));
  } else if (action === "delete") {
    try {
      await deleteTenantUser(id);
    } catch (e: any) {
      return badRequest({
        error: e.toString(),
      });
    }
    return redirect(UrlUtils.currentTenantUrl(params, "settings/members"));
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags ?? [];

interface Props {
  maxSize?: string;
}

export default function EditMemberRoute({ maxSize = "sm:max-w-lg" }: Props) {
  const params = useParams();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const appData = useAppData();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const submit = useSubmit();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);
  const confirmRemove = useRef<RefConfirmModal>(null);

  // const [item, setItem] = useState<TenantUserDto | null>(null);
  // const [loading, setLoading] = useState(false);
  // const [email, setEmail] = useState("");
  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");
  // const [phone, setPhone] = useState("");

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    if (actionData?.success) {
      successModal.current?.show(t("shared.success"), actionData.success);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  function close() {
    navigate(UrlUtils.currentTenantUrl(params, "settings/members"));
  }
  function remove() {
    if (!data.member) {
      return;
    }
    confirmRemove.current?.show(
      t("shared.confirmRemove"),
      t("shared.remove"),
      t("shared.cancel"),
      t("settings.members.actions.removeConfirm", { 0: data.member?.user.email })
    );
  }
  function yesRemove() {
    if (appData.currentRole === TenantUserType.MEMBER) {
      errorModal.current?.show(t("account.tenant.onlyAdmin"));
    } else {
      const form = new FormData();
      form.set("action", "delete");
      submit(form, {
        method: "post",
      });
    }
  }

  useEscapeKeypress(close);
  return (
    <div>
      {(() => {
        if (!data.member) {
          return <div>{t("shared.notFound")}</div>;
        } else if (data.member) {
          return (
            <Form method="post" className="space-y-4">
              <input hidden type="text" name="action" value="edit" readOnly />
              <div className="grid grid-cols-2 gap-2">
                {/*Email */}
                <InputText
                  className="col-span-2"
                  disabled={!getUserHasPermission(appData, "app.settings.members.update")}
                  name="email"
                  title={t("models.user.email")}
                  autoComplete="off"
                  readOnly
                  defaultValue={data.member?.user.email || actionData?.fields?.email}
                />
                {/*Email: End */}

                {/*User First Name */}
                <InputText
                  type="text"
                  disabled={!getUserHasPermission(appData, "app.settings.members.update")}
                  name="first-name"
                  title={t("models.user.firstName")}
                  autoComplete="off"
                  readOnly
                  defaultValue={data.member?.user.firstName || actionData?.fields?.firstName}
                />
                {/*User First Name: End */}

                {/*User Last Name */}
                <InputText
                  disabled={!getUserHasPermission(appData, "app.settings.members.update")}
                  type="text"
                  title={t("models.user.lastName")}
                  name="last-name"
                  autoComplete="off"
                  readOnly
                  defaultValue={data.member?.user.lastName || actionData?.fields?.lastName}
                />
                {/*User Last Name: End */}
              </div>

              <div className="mt-4 flex items-center justify-between">
                {(() => {
                  if (loading) {
                    return (
                      <div className="text-theme-700 text-sm">
                        <div>{t("shared.loading")}...</div>
                      </div>
                    );
                  } else {
                    return (
                      <div>
                        <ButtonSecondary
                          destructive
                          disabled={!getUserHasPermission(appData, "app.settings.members.delete")}
                          onClick={remove}
                          isLoading={loading}
                        >
                          <div>{t("shared.remove")}</div>
                        </ButtonSecondary>
                      </div>
                    );
                  }
                })()}

                <div className="flex items-center space-x-2">
                  <ButtonSecondary
                    disabled={loading}
                    className={clsx(
                      "focus:ring-theme-500 inline-flex items-center space-x-2 border border-gray-300 bg-white px-3 py-2 font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:rounded-md sm:text-sm",
                      loading && "cursor-not-allowed bg-gray-100"
                    )}
                    type="button"
                    onClick={close}
                  >
                    <div>{t("shared.cancel")}</div>
                  </ButtonSecondary>
                  {/* <ButtonPrimary disabled={loading || !getUserHasPermission( appData,"app.settings.members.update")} type="submit">
                    <div>{t("shared.save")}</div>
                  </ButtonPrimary> */}
                </div>
              </div>
            </Form>
          );
        } else {
          return <div></div>;
        }
      })()}

      <ConfirmModal ref={confirmRemove} onYes={yesRemove} />
      <ErrorModal ref={errorModal} />
      <SuccessModal ref={successModal} onClosed={close} />
    </div>
  );
}
