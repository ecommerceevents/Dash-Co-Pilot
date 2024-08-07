import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useNavigate, useNavigation, useParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTypedActionData } from "remix-typedjson";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import { getTranslations } from "~/locale/i18next.server";
import { createPortalUser, getPortalUserByEmail } from "~/modules/portals/db/portalUsers.db.server";
import { getPortalById } from "~/modules/portals/db/portals.db.server";
import UrlUtils from "~/utils/app/UrlUtils";
import bcrypt from "bcryptjs";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { toast } from "sonner";

type LoaderData = {};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await getPortalById(tenantId, params.portal!);
  if (!portal) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }
  const data: LoaderData = {};
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);

  const form = await request.formData();
  const action = form.get("action")?.toString();

  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await getPortalById(tenantId, params.portal!);
  if (!portal) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }

  if (action === "create") {
    const email = form.get("email")?.toString();
    const firstName = form.get("firstName")?.toString();
    const lastName = form.get("lastName")?.toString();
    const password = form.get("password")?.toString();
    const avatar = form.get("avatar")?.toString();

    if (!email || !password || !firstName) {
      return json({ error: "Missing required fields." }, { status: 400 });
    }
    const existingUser = await getPortalUserByEmail(portal.id, email);
    if (existingUser) {
      return json({ error: "User already exists with that email." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await createPortalUser({
      tenantId,
      portalId: portal.id,
      email,
      passwordHash,
      firstName,
      lastName: lastName ?? "",
      avatar: avatar ?? null,
    });

    return redirect(UrlUtils.getModulePath(params, `portals/${portal.id}/users`));
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function () {
  const { t } = useTranslation();
  const actionData = useTypedActionData<ActionData>();
  const params = useParams();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const mainInput = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      mainInput.current?.input.current?.focus();
    }, 100);
  }, []);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <div>
      <Form method="post" className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
        <input type="hidden" name="action" value="create" hidden readOnly />

        <div className="space-y-2">
          <InputText ref={mainInput} autoFocus type="email" name="email" title={t("models.user.email")} value={email} setValue={setEmail} required />

          <InputText type="password" name="password" title={t("account.shared.password")} value={password} setValue={setPassword} required />

          <InputText name="firstName" title={t("models.user.firstName")} value={firstName} setValue={setFirstName} required />

          <InputText name="lastName" title={t("models.user.lastName")} value={lastName} setValue={setLastName} />
        </div>
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <ButtonSecondary type="button" className="w-full" onClick={() => navigate(UrlUtils.getModulePath(params, `portals/${params.portal}/users`))}>
            <div className="w-full text-center">{t("shared.back")}</div>
          </ButtonSecondary>
          <LoadingButton type="submit" disabled={navigation.state === "submitting"} className="w-full">
            {t("shared.save")}
          </LoadingButton>
        </div>
      </Form>
    </div>
  );
}
