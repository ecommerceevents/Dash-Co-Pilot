import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction, json, redirect } from "@remix-run/node";
import { useNavigate, useOutlet, useParams, useSubmit } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { toast } from "sonner";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import UserBadge from "~/components/core/users/UserBadge";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getTranslations } from "~/locale/i18next.server";
import { deletePortalUser, getPortalUserById, getPortalUsers, updatePortalUserPassword } from "~/modules/portals/db/portalUsers.db.server";
import { PortalWithDetails, getPortalById } from "~/modules/portals/db/portals.db.server";
import { PortalUserDto } from "~/modules/portals/dtos/PortalUserDto";
import UrlUtils from "~/utils/app/UrlUtils";
import DateUtils from "~/utils/shared/DateUtils";
import bcrypt from "bcryptjs";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];

type LoaderData = {
  metatags: MetaTagsDto;
  item: PortalWithDetails;
  items: PortalUserDto[];
};
export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const tenantId = await getTenantIdOrNull({ request, params });
  const item = await getPortalById(tenantId, params.portal!);
  if (!item) {
    return redirect(UrlUtils.getModulePath(params, "portals"));
  }
  const items = await getPortalUsers(item.id);
  const data: LoaderData = {
    metatags: [{ title: `${t("models.user.plural")} | ${item.title} | ${process.env.APP_NAME}` }],
    item,
    items,
  };
  return json(data);
};

type ActionData = {
  success?: string;
  error?: string;
};
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action")?.toString();
  const userId = form.get("id")?.toString() ?? "";

  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await getPortalById(tenantId, params.portal!);
  if (!portal) {
    return json({ error: t("shared.notFound") }, { status: 404 });
  }

  const user = await getPortalUserById(portal.id, userId);

  if (!userId || !user || !action) {
    return json({ error: "Form not submitted correctly." }, { status: 400 });
  }
  switch (action) {
    case "change-password": {
      const passwordNew = form.get("password-new")?.toString();
      if (!passwordNew || passwordNew.length < 8) {
        return json({ error: "Set a password with 8 characters minimum" }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(passwordNew, 10);
      await updatePortalUserPassword(user.id, { passwordHash });

      return json({ success: t("shared.updated") });
    }
    case "delete-user": {
      try {
        await deletePortalUser(portal.id, userId);
        return json({ success: t("shared.deleted") });
      } catch (e: any) {
        return json({ error: e }, { status: 400 });
      }
    }
    default: {
      return json({ error: "Form not submitted correctly." }, { status: 400 });
    }
  }
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const params = useParams();
  const outlet = useOutlet();
  const navigate = useNavigate();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  function onChangePassword(user: PortalUserDto) {
    const password = prompt(t("settings.profile.changePassword"));
    if (password && confirm("Update password for user " + user.email + "?")) {
      const form = new FormData();
      form.set("action", "change-password");
      form.set("id", user.id);
      form.set("password-new", password);
      submit(form, {
        method: "post",
      });
    }
  }
  function deleteUser(item: PortalUserDto) {
    if (confirmDelete.current) {
      confirmDelete.current.setValue(item);
      confirmDelete.current.show(t("shared.delete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
    }
  }
  function onConfirmDeleteUser(item: PortalUserDto) {
    const form = new FormData();
    form.set("action", "delete-user");
    form.set("id", item.id);
    submit(form, {
      method: "post",
    });
  }

  return (
    <EditPageLayout
      title={t("models.user.plural")}
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
          title: t("models.user.plural"),
        },
      ]}
      buttons={
        <>
          <ButtonPrimary to="new">{t("shared.new")}</ButtonPrimary>
        </>
      }
    >
      <TableSimple
        items={data.items}
        actions={[
          {
            title: t("settings.profile.changePassword"),
            onClick: (_, item) => onChangePassword(item),
          },
          {
            title: t("shared.delete"),
            onClick: (_, item) => deleteUser(item),
            destructive: true,
            hidden: () => true,
          },
          {
            title: t("shared.edit"),
            onClickRoute: (_, item) => item.id,
          },
        ]}
        headers={[
          {
            name: "user",
            title: t("models.user.object"),
            value: (item) => <UserBadge item={item} withAvatar={true} />,
          },
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (item) => (
              <time dateTime={DateUtils.dateYMDHMS(item.createdAt)} title={DateUtils.dateYMDHMS(item.createdAt)}>
                {DateUtils.dateAgo(item.createdAt)}
              </time>
            ),
          },
        ]}
      />

      <SlideOverWideEmpty
        open={!!outlet}
        onClose={() => {
          navigate(".", { replace: true });
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
        title={params.userId ? t("shared.edit") : t("shared.new")}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{outlet}</div>
        </div>
      </SlideOverWideEmpty>

      <ConfirmModal ref={confirmDelete} onYes={onConfirmDeleteUser} destructive />
    </EditPageLayout>
  );
}
