import { useLocation, useNavigate } from "@remix-run/react";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InputSelectorDarkMode from "~/components/ui/input/dark/InputSelectorDarkMode";
import { useAppData } from "~/utils/data/useAppData";
import { TenantSimple } from "~/utils/db/tenants.db.server";
import { TenantTypeRelationshipWithDetails } from "~/utils/db/tenants/tenantTypeRelationships.db.server";

interface Props {
  className?: string;
}

export default function TenantSelector({ className }: Props) {
  const { t } = useTranslation();
  const appData = useAppData();
  const location = useLocation();
  const navigate = useNavigate();

  const [selected, setSelected] = useState(appData?.currentTenant?.slug);

  const tenants: { relationship?: TenantTypeRelationshipWithDetails; tenant: TenantSimple }[] = [
    ...appData?.childTenants.map((f) => {
      return {
        tenant: f.toTenant,
        relationship: f.tenantTypeRelationship,
      };
    }),
    ...appData?.myTenants.map((tenant) => {
      return {
        tenant,
      };
    }),
  ];

  useEffect(() => {
    if (selected) {
      const tenant = tenants.find((f) => f.tenant.slug === selected);
      if (tenant) {
        navigate(
          location.pathname
            .replace(`/app/${appData?.currentTenant.slug}`, `/app/${tenant.tenant.slug}`)
            .replace(`/app/${appData?.currentTenant.id}`, `/app/${tenant.tenant.slug}`)
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  function getAllTenants() {
    const items = tenants
      .map((f) => {
        let group = t("models.tenant.plural");
        if (f.relationship) {
          group = f.relationship?.toType?.titlePlural ?? t("models.tenant.object");
        } else if (f.tenant.types.length > 0) {
          group = f.tenant.types[0].titlePlural ?? t("models.tenant.plural");
        }
        return {
          group,
          value: f.tenant.slug,
          name: f.tenant.name,
          img: f.tenant.icon ? (
            <img className="inline-block h-6 w-6 shrink-0 rounded-md bg-gray-700 shadow-sm" src={f.tenant.icon} alt={f.tenant.name} />
          ) : (
            <span className="bg-primary inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md">
              <span className="text-theme-200 text-xs font-medium leading-none">{f.tenant?.name.substring(0, 1)}</span>
            </span>
          ),
          // link: location.pathname.replace(`/app/${appData.currentTenant.slug}`, `/app/${f?.slug}`),
        };
      })
      .sort((a, b) => a.group.localeCompare(b.group));
    // return unique slugs
    const unique = items.filter((item, index, self) => self.findIndex((t) => t.value === item.value) === index);
    return unique;
  }
  return (
    <Fragment>
      {tenants.length > 1 && (
        <InputSelectorDarkMode
          withSearch={false}
          value={selected}
          renderSelected={(e) => {
            const tenant = tenants.find((f) => f.tenant.slug === e.value);
            if (tenant?.relationship) {
              return (
                <div>
                  {tenant?.relationship?.toType?.title ?? t("models.tenant.object")}: {tenant?.tenant.name}
                </div>
              );
            }
            return <div>{tenant?.tenant.name}</div>;
          }}
          options={getAllTenants()}
          setValue={(e) => setSelected(e?.toString() ?? "")}
        />
      )}
    </Fragment>
  );
}
