import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useParams, useSubmit } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { toast } from "react-hot-toast";
import Stripe from "stripe";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import XIcon from "~/components/ui/icons/XIcon";
import InputSelect from "~/components/ui/input/InputSelect";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { PortalWithDetails, getPortalById, updatePortal } from "~/modules/portals/db/portals.db.server";
import StripeConnectUtils from "~/modules/portals/utils/StripeConnectUtils";
import UrlUtils from "~/utils/app/UrlUtils";
import { getUser } from "~/utils/db/users.db.server";
import { getUserInfo } from "~/utils/session.server";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import StripeConnectServer from "~/modules/portals/services/StripeConnect.server";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import { useTranslation } from "react-i18next";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";

type LoaderData = {
  item: PortalWithDetails;
  stripeAccount: Stripe.Account | null;
};

export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  const appConfiguration = await getAppConfiguration({ request });
  if (!appConfiguration.portals?.pricing) {
    throw json({ error: "Pricing is not enabled" }, { status: 400 });
  }

  const tenantId = await getTenantIdOrNull({ request, params });
  const item = await getPortalById(tenantId, params.portal!);
  if (!item) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }
  let stripeAccount: Stripe.Account | null = null;
  try {
    stripeAccount = item.stripeAccountId ? await StripeConnectServer.getStripeAccount(item.stripeAccountId) : null;
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(e.message);
    await updatePortal(item, {
      stripeAccountId: null,
    });
  }
  const data: LoaderData = {
    item,
    stripeAccount,
  };
  return json(data);
};

type ActionData = {
  error?: string;
  success?: string;
};
export let action = async ({ request, params }: ActionFunctionArgs) => {
  const userInfo = await getUserInfo(request);
  const user = await getUser(userInfo.userId);
  const form = await request.formData();
  const action = form.get("action");
  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await getPortalById(tenantId, params.portal!);
  if (!portal) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }

  const url = new URL(request.url);
  let baseUrl = `${url.protocol}//${url.host}`;

  if (action === "connectStripe") {
    try {
      const country = form.get("country") as string;
      if (!country) {
        return json({ error: "Country is required" }, { status: 400 });
      }
      const stripeAccount = await StripeConnectServer.createStripeAccount({
        email: user!.email,
        country,
        metadata: {
          tenantId: portal.tenantId ?? "{admin}",
        },
      });
      await updatePortal(portal, {
        stripeAccountId: stripeAccount.id,
      });
      portal.stripeAccountId = stripeAccount.id;

      const stripeAccountLink = await StripeConnectServer.createStripeAccountLink({
        account: portal.stripeAccountId,
        return_url: baseUrl + UrlUtils.getModulePath(params, `portals/${portal.id}/pricing`),
        refresh_url: request.url,
      });
      return redirect(stripeAccountLink.url);
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else if (action === "reconnectStripe") {
    try {
      if (!portal.stripeAccountId) {
        return json({ error: "No Stripe account found" }, { status: 400 });
      }
      const stripeAccount = await StripeConnectServer.getStripeAccount(portal.stripeAccountId);
      if (!stripeAccount) {
        return json({ error: "No Stripe account found with id: " + portal.stripeAccountId }, { status: 400 });
      }
      await updatePortal(portal, {
        stripeAccountId: stripeAccount.id,
      });
      portal.stripeAccountId = stripeAccount.id;
      const stripeAccountLink = await StripeConnectServer.createStripeAccountLink({
        account: portal.stripeAccountId,
        return_url: baseUrl + UrlUtils.getModulePath(params, `portals/${portal.id}/pricing`),
        refresh_url: request.url,
      });
      return redirect(stripeAccountLink.url);
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else if (action === "deleteStripe") {
    try {
      if (!portal.stripeAccountId) {
        return json({ error: "No Stripe account found" }, { status: 400 });
      }
      await updatePortal(portal, {
        stripeAccountId: null,
      });
      await StripeConnectServer.deleteStripeAccount(portal.stripeAccountId);
      return json({ success: "Stripe account deleted" });
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const submit = useSubmit();
  const params = useParams();

  const confirmDelete = useRef<RefConfirmModal>(null);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    } else if (actionData?.success) {
      toast.success(actionData.success);
    }
  }, [actionData]);

  function onDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  function onDeleteConfirm() {
    const form = new FormData();
    form.set("action", "deleteStripe");
    submit(form, {
      method: "post",
    });
  }

  return (
    <EditPageLayout
      title="Connect Stripe"
      withHome={false}
      menu={[
        // {
        //   title: t("models.portal.plural"),
        //   routePath: UrlUtils.getModulePath(params, "portals"),
        // },
        {
          title: data.item.title,
          routePath: UrlUtils.getModulePath(params, `portals/${data.item.subdomain}`),
        },
        {
          title: "Pricing",
          routePath: UrlUtils.getModulePath(params, `portals/${data.item.subdomain}/pricing`),
        },
        {
          title: "Stripe",
        },
      ]}
    >
      {!data.stripeAccount ? (
        <div className="space-y-2">
          <p className="">Start accepting payments by connecting your Stripe account.</p>
          <Form method="post" className="space-y-2">
            <input type="hidden" name="action" value="connectStripe" />
            <div className="w-40">
              <InputSelect name="country" title="Country" placeholder="Select..." options={StripeConnectUtils.stripeConnectCountries} required />
            </div>
            <div>
              <LoadingButton
                className="bg-[#5433FF] text-white hover:bg-[#4F2DFF] focus:ring-[#5433FF] focus:ring-opacity-50 active:bg-[#4F2DFF]"
                type="submit"
              >
                Connect with Stripe
              </LoadingButton>
            </div>
          </Form>
        </div>
      ) : !data.stripeAccount.charges_enabled ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <XIcon className="h-6 w-6 text-red-500" />
            <div className="text-lg font-medium">Your Stripe integration is pending</div>
          </div>
          <Form method="post">
            <input type="hidden" name="action" value="reconnectStripe" />
            <LoadingButton
              className="bg-[#5433FF] hover:bg-[#4F2DFF] focus:ring-[#5433FF] focus:ring-opacity-50 active:bg-[#4F2DFF]"
              type="submit"
              actionName="reconnectStripe"
            >
              Reconnect
            </LoadingButton>
          </Form>

          <div className="space-y-2">
            <Form method="post" onSubmit={onDelete}>
              <input type="hidden" name="action" value="deleteStripe" />
              <ButtonSecondary destructive type="submit">
                Disconnect
              </ButtonSecondary>
            </Form>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <CheckIcon className="h-6 w-6 text-green-500" />
            <div className="text-lg font-medium">Stripe connected</div>
          </div>

          <div>
            <Form method="post" onSubmit={onDelete}>
              <input type="hidden" name="action" value="deleteStripe" />
              <ButtonSecondary destructive type="submit">
                Disconnect
              </ButtonSecondary>
            </Form>
          </div>
        </div>
      )}
      <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirm} destructive />
    </EditPageLayout>
  );
}
