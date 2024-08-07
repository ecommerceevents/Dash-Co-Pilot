import { Link, useNavigation } from "@remix-run/react";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import DateCell from "~/components/ui/dates/DateCell";
import ExternalLinkEmptyIcon from "~/components/ui/icons/ExternalLinkEmptyIcon";
import TableSimple from "~/components/ui/tables/TableSimple";
import { TenantSimple } from "~/utils/db/tenants.db.server";
import { TenantRelationshipWithDetails } from "~/utils/db/tenants/tenantRelationships.db.server";
import DeactivateTenantModal from "../tenants/DeactivateTenantModal";

export default function LinkedAccountsTable({
  items,
  onDelete,
  onDeactivated,
}: {
  items: TenantRelationshipWithDetails[];
  onDelete?: (item: TenantRelationshipWithDetails) => void;
  onDeactivated?: (item: TenantSimple, reason: string, activate: boolean) => void;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [deactivatingTenant, setDeactivatingTenant] = useState<TenantSimple>();

  function onToggleActive(item: TenantSimple) {
    if (!item.deactivatedReason) {
      setDeactivatingTenant(item);
    } else {
      onConfirmedToggleActive(item, "", true);
    }
  }

  function onConfirmedToggleActive(value: TenantSimple, reason: string, activate: boolean) {
    if (onDeactivated) {
      onDeactivated(value, reason, activate);
    }

    setDeactivatingTenant(undefined);
  }
  function canDeactivate(item: TenantRelationshipWithDetails) {
    if (item.tenantTypeRelationship.permissions.find((f) => f.name === "app.settings.account.delete")) {
      return true;
    }
    return false;
  }
  return (
    <div>
      <TableSimple
        items={items}
        actions={[
          {
            renderTitle: (i) => (!i.toTenant.deactivatedReason ? t("shared.deactivate") : t("shared.activate")),
            onClick: (_idx, item) => onToggleActive(item.toTenant),
            disabled: () => navigation.state === "submitting",
            hidden: (i) => !canDeactivate(i) || !onDeactivated,
            renderIsDestructive: (i) => !i.toTenant.deactivatedReason,
          },
        ]}
        headers={[
          {
            name: "type",
            title: t("shared.type"),
            value: (i) =>
              // <SimpleBadge
              //   title={i.tenantTypeRelationship.toType?.title ?? t("models.tenant.object")}
              //   color={i.tenantTypeRelationship.toType?.title === "Client" ? Colors.GREEN : Colors.BLUE}
              // />
              i.tenantTypeRelationship.toType?.title ?? t("models.tenant.object"),
          },
          {
            name: "name",
            title: t("models.tenant.name"),
            className: "w-full",
            value: (i) => (
              <div className="max-w-sm truncate">
                <div className="flex items-center space-x-1 truncate font-medium text-gray-800">
                  <div>{i.toTenant.name}</div>
                  {i.toTenant.deactivatedReason && <SimpleBadge title={t("shared.deactivated") + ": " + i.toTenant.deactivatedReason} color={Colors.RED} />}
                </div>

                <Link
                  to={"/app/" + i.toTenant.slug}
                  className="rounded-md border-b border-dashed text-xs text-gray-500 hover:border-dashed hover:border-gray-400 focus:bg-gray-100"
                >
                  <span>/{i.toTenant.slug}</span>
                </Link>
              </div>
            ),
          },
          {
            name: "users",
            title: t("models.user.plural"),
            className: "max-w-xs truncate",
            value: (i) => (
              <a rel="noreferrer" target="_blank" href={`/app/${i.toTenant.slug}/settings/members`} className="hover:underline">
                {/* {i.toTenant.users.length === 0 && <div>-</div>}
              {i.toTenant.users.map((f) => f.user.email).join(", ")} */}
                <div className="flex items-center space-x-1">
                  <div>
                    {i.toTenant.users.length} {i.toTenant.users.length === 1 ? t("models.user.object") : t("models.user.plural")}
                  </div>
                  {/* <ExternalLinkEmptyIcon className="h-3.5 w-3.5" /> */}
                </div>
              </a>
            ),
          },
          {
            name: "settings",
            title: t("shared.settings"),
            className: "max-w-xs truncate justify-center",
            value: (i) => (
              <a rel="noreferrer" target="_blank" href={`/app/${i.toTenant.slug}/settings/account`} className="mx-auto flex justify-center hover:underline">
                <div className="flex items-center space-x-1">
                  {/* <div>{t("shared.settings")}</div> */}
                  <ExternalLinkEmptyIcon className="h-3.5 w-3.5" />
                </div>
              </a>
            ),
          },
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (i) => i.createdAt,
            formattedValue: (item) => <DateCell date={item.createdAt} displays={["ago"]} />,
          },
          {
            name: "actions",
            title: "",
            value: (i) => (
              <Fragment>
                {onDelete && (
                  <ButtonTertiary destructive onClick={() => onDelete(i)}>
                    {t("shared.unlink")}
                  </ButtonTertiary>
                )}
              </Fragment>
            ),
          },
        ]}
      />

      <DeactivateTenantModal
        open={!!deactivatingTenant}
        onClose={() => setDeactivatingTenant(undefined)}
        item={deactivatingTenant}
        onConfirm={(item, reason) => onConfirmedToggleActive(item, reason, false)}
      />
    </div>
  );
}
