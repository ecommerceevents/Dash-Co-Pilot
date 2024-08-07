import { useTranslation } from "react-i18next";
import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { adminGetAllTenantsWithUsage, createTenantUser, TenantSimple, TenantWithUsage, updateTenantDeactivated } from "~/utils/db/tenants.db.server";
import { getTranslations } from "~/locale/i18next.server";
import TenantsTable from "~/components/core/tenants/TenantsTable";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import InputFilters from "~/components/ui/input/InputFilters";
import { FilterablePropertyDto } from "~/application/dtos/data/FilterablePropertyDto";
import { adminGetAllUsersNames } from "~/utils/db/users.db.server";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { useTypedLoaderData } from "remix-typedjson";
import { useEffect, useRef, useState } from "react";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import Stripe from "stripe";
import { getStripeInvoices } from "~/utils/stripe.server";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import { serverTimingHeaders } from "~/modules/metrics/utils/defaultHeaders.server";
import { getAllTenantTypes } from "~/utils/db/tenants/tenantTypes.db.server";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import { EntityWithDetails, findEntityByName } from "~/utils/db/entities/entities.db.server";
import { TenantsApi } from "~/utils/api/.server/TenantsApi";
import { getAllRoles } from "~/utils/db/permissions/roles.db.server";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import FormGroup from "~/components/ui/forms/FormGroup";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import RowProperties from "~/components/entities/rows/RowProperties";
import UrlUtils from "~/utils/app/UrlUtils";
import { getExistingSlug } from "~/utils/services/tenantService";
import DeactivateTenantModal from "~/components/core/tenants/DeactivateTenantModal";
export { serverTimingHeaders as headers };

type LoaderData = {
  title: string;
  items: TenantWithUsage[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
  tenantInvoices: Stripe.Invoice[];
  isStripeTest: boolean;
  tenantSettingsEntity: EntityWithDetails | null;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "admin.accounts");
  await time(verifyUserHasPermission(request, "admin.accounts.view"), "verifyUserHasPermission");
  let { t } = await time(getTranslations(request), "getTranslations");

  const filterableProperties = [
    { name: "name", title: "models.tenant.name" },
    { name: "slug", title: "models.tenant.slug" },
    {
      name: "userId",
      title: "models.user.object",
      manual: true,
      options: (await time(adminGetAllUsersNames(), "adminGetAllUsersNames")).map((item) => {
        return {
          value: item.id,
          name: item.email,
        };
      }),
    },
    {
      name: "typeId",
      title: t("shared.type"),
      manual: true,
      options: [
        { value: "null", name: "- Default -" },
        ...(await time(getAllTenantTypes(), "getAllTenantTypes")).map((item) => {
          return {
            value: item.id,
            name: t(item.title),
          };
        }),
      ],
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await time(adminGetAllTenantsWithUsage(filters, currentPagination), "adminGetAllTenantsWithUsage");

  const tenantInvoices: Stripe.Invoice[] = [];
  await Promise.all(
    items.map(async (item) => {
      if (item.subscription?.stripeCustomerId) {
        const invoices = await getStripeInvoices(item.subscription?.stripeCustomerId);
        tenantInvoices.push(...invoices);
      }
    })
  );

  const data: LoaderData = {
    title: `${t("models.tenant.plural")} | ${process.env.APP_NAME}`,
    items: items.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)),
    filterableProperties,
    pagination,
    tenantInvoices,
    isStripeTest: process.env.STRIPE_SK?.toString().startsWith("sk_test_") ?? true,
    tenantSettingsEntity: await findEntityByName({ tenantId: null, name: "tenantSettings" }),
  };
  return json(data, { headers: getServerTimingHeader() });
};

type ActionData = {
  error?: string;
  success?: string;
  createdTenantId?: string;
};
export const action = async ({ request }: ActionFunctionArgs) => {
  const { t } = await getTranslations(request);

  const form = await request.formData();
  const action = form.get("action")?.toString();
  const id = form.get("id")?.toString();
  if (action === "deactivate" && id) {
    const deactivatedReason = form.get("reason")?.toString();
    if (!deactivatedReason) {
      return json({ error: t("shared.invalidForm") }, { status: 400 });
    }
    await updateTenantDeactivated(id, {
      active: false,
      deactivatedReason,
    });
    return json({});
  } else if (action === "activate" && id) {
    await updateTenantDeactivated(id, {
      active: true,
      deactivatedReason: null,
    });
    return json({});
  } else if (action === "create") {
    const name = form.get("name")?.toString() ?? "";
    const slug = form.get("slug")?.toString() ?? "";
    const existingSlug = await getExistingSlug(slug);
    if (!slug || existingSlug) {
      return json({ error: t("shared.slugTaken") }, { status: 400 });
    }
    const { tenant, user } = await TenantsApi.create({ request, form, name, slug });
    const addMySelf = Boolean(form.get("addMySelf"));
    if (addMySelf) {
      const roles = await getAllRoles("app");
      await createTenantUser(
        {
          tenantId: tenant.id,
          userId: user.id,
          type: TenantUserType.OWNER,
        },
        roles
      );
    }
    const data: ActionData = {
      createdTenantId: tenant.id,
    };
    return json(data);
  } else {
    return json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function AdminTenantsRoute() {
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const appOrAdminData = useAppOrAdminData();
  const { t } = useTranslation();
  const submit = useSubmit();
  const navigation = useNavigation();

  const [deactivatingTenant, setDeactivatingTenant] = useState<TenantWithUsage>();
  const [creatingNewAccount, setCreatingNewAccount] = useState(false);

  useEffect(() => {
    if (actionData?.createdTenantId) {
      setCreatingNewAccount(false);
    }
  }, [actionData]);

  function onToggleActive(item: TenantWithUsage) {
    if (!item.deactivatedReason) {
      setDeactivatingTenant(item);
    } else {
      onConfirmedToggleActive(item, "", true);
    }
  }

  function onConfirmedToggleActive(value: TenantSimple, reason: string, activate: boolean) {
    const form = new FormData();
    form.set("action", !activate ? "deactivate" : "activate");
    form.set("reason", reason ?? "");
    form.set("id", value.id);
    submit(form, {
      method: "post",
    });

    setDeactivatingTenant(undefined);
  }

  return (
    <EditPageLayout
      title={t("models.tenant.plural")}
      buttons={
        <>
          <InputFilters filters={data.filterableProperties} />
          <ButtonPrimary disabled={!getUserHasPermission(appOrAdminData, "admin.accounts.create")} onClick={() => setCreatingNewAccount(true)}>
            {t("shared.new")}
          </ButtonPrimary>
        </>
      }
    >
      <TenantsTable
        items={data.items}
        pagination={data.pagination}
        tenantInvoices={data.tenantInvoices}
        isStripeTest={data.isStripeTest}
        actions={[
          {
            renderTitle: (i) => (!i.deactivatedReason ? t("shared.deactivate") : t("shared.activate")),
            onClick: (_idx, item) => onToggleActive(item),
            disabled: () => navigation.state === "submitting",
            renderIsDestructive: (i) => !i.deactivatedReason,
          },
        ]}
      />

      <DeactivateTenantModal
        open={!!deactivatingTenant}
        onClose={() => setDeactivatingTenant(undefined)}
        item={deactivatingTenant}
        onConfirm={(item, reason) => onConfirmedToggleActive(item, reason, false)}
      />

      <SlideOverWideEmpty
        title={"New Account"}
        open={creatingNewAccount}
        onClose={() => {
          setCreatingNewAccount(false);
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">
            <CreateTenantForm tenantSettingsEntity={data.tenantSettingsEntity} />
          </div>
        </div>
      </SlideOverWideEmpty>

      <ActionResultModal actionData={actionData} />
    </EditPageLayout>
  );
}

function CreateTenantForm({ tenantSettingsEntity }: { tenantSettingsEntity: EntityWithDetails | null }) {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [addMySelf, setAddMySelf] = useState(true);

  useEffect(() => {
    setSlug(UrlUtils.slugify(name));
  }, [name]);

  const firstInput = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      firstInput.current?.input.current?.focus();
    }, 100);
  }, []);

  return (
    <FormGroup
      labels={{
        create: t("shared.create"),
      }}
      withErrorModal={false}
    >
      <div className="space-y-3">
        <InputText ref={firstInput} autoFocus name="name" title={t("shared.name")} value={name} setValue={setName} required />
        <InputText name="slug" title={t("shared.slug")} value={slug} setValue={setSlug} required onBlur={() => setSlug(UrlUtils.slugify(slug))} />
        {tenantSettingsEntity && (
          <div className="col-span-6 sm:col-span-6">
            <RowProperties entity={tenantSettingsEntity} item={null} />
          </div>
        )}
        <InputCheckboxWithDescription
          name="addMySelf"
          title="Add myself as owner"
          description="You will be added as owner of the new account."
          value={addMySelf}
          setValue={setAddMySelf}
        />
      </div>
    </FormGroup>
  );
}
