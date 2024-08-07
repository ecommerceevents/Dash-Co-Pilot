import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import FormGroup from "~/components/ui/forms/FormGroup";
import InputSelector from "~/components/ui/input/InputSelector";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { TenantSimple } from "~/utils/db/tenants.db.server";
import { TenantRelationshipWithDetails } from "~/utils/db/tenants/tenantRelationships.db.server";
import { TenantTypeRelationshipWithDetails } from "~/utils/db/tenants/tenantTypeRelationships.db.server";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";

export function TenantRelationshipForm({
  item,
  tenantTypeRelationships,
  allTenants,
}: {
  item?: TenantRelationshipWithDetails;
  allTenants: TenantSimple[];
  tenantTypeRelationships: TenantTypeRelationshipWithDetails[];
}) {
  const appOrAdminData = useAppOrAdminData();
  const navigate = useNavigate();

  const [relationshipId, setRelationshipId] = useState<string>(item?.tenantTypeRelationshipId ?? "");
  const [fromTenantId, setFromTenantId] = useState<string>(item?.fromTenantId ?? "");
  const [toTenantId, setToTenantId] = useState<string>(item?.toTenantId ?? "");

  function getRelationshipTitle(item: TenantTypeRelationshipWithDetails) {
    return `${item.fromType?.title ?? "Default"} to ${item.toType?.title ?? "Default"}`;
  }

  function getFromTenants() {
    const selectedFromType = tenantTypeRelationships.find((f) => f.id === relationshipId)?.fromType;
    if (!selectedFromType) {
      return allTenants;
    }
    const tenants: TenantSimple[] = [];
    allTenants.forEach((tenant) => {
      if (tenant.types.find((f) => f.id === selectedFromType.id)) {
        tenants.push(tenant);
      }
    });
    return tenants;
  }

  function getToTenants() {
    const selectedToType = tenantTypeRelationships.find((f) => f.id === relationshipId)?.toType;
    if (!selectedToType) {
      return allTenants;
    }
    const tenants: TenantSimple[] = [];
    allTenants.forEach((tenant) => {
      if (tenant.types.find((f) => f.id === selectedToType.id)) {
        tenants.push(tenant);
      }
    });
    return tenants;
  }

  return (
    <FormGroup
      id={item?.id}
      onCancel={() => navigate("/admin/accounts/relationships")}
      editing={true}
      canDelete={getUserHasPermission(appOrAdminData, "admin.relationships.delete")}
      withErrorModal={false}
    >
      <div className="space-y-2">
        <InputSelector
          name="relationshipId"
          title="Relationship"
          value={relationshipId}
          setValue={(e) => setRelationshipId(e?.toString() ?? "")}
          options={tenantTypeRelationships.map((f) => {
            return { value: f.id, name: getRelationshipTitle(f) };
          })}
          withSearch={false}
        />

        <InputSelector
          name="fromTenantId"
          title="From"
          value={fromTenantId}
          setValue={(e) => setFromTenantId(e?.toString() ?? "")}
          options={getFromTenants().map((f) => {
            return { value: f.id, name: `${f.name} (${f.slug})` };
          })}
        />

        <InputSelector
          name="toTenantId"
          title="To"
          value={toTenantId}
          setValue={(e) => setToTenantId(e?.toString() ?? "")}
          options={getToTenants().map((f) => {
            return { value: f.id, name: `${f.name} (${f.slug})` };
          })}
        />
      </div>
    </FormGroup>
  );
}
