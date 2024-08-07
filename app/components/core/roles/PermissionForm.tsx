import InputText from "~/components/ui/input/InputText";
import { useTranslation } from "react-i18next";
import { RoleWithPermissions } from "~/utils/db/permissions/roles.db.server";
import { PermissionWithRoles } from "~/utils/db/permissions/permissions.db.server";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import { useEffect, useState } from "react";
import FormGroup from "~/components/ui/forms/FormGroup";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import RoleBadge from "./RoleBadge";
import InputRadioGroup from "~/components/ui/input/InputRadioGroup";
import InputSearch from "~/components/ui/input/InputSearch";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";

interface Props {
  item?: PermissionWithRoles;
  roles: RoleWithPermissions[];
  onCancel: () => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function PermissionForm({ item, roles, onCancel, canUpdate = true, canDelete }: Props) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();

  const [permissionRoles, setRoles] = useState<string[]>([]);
  const [type, setType] = useState<string | number | undefined>(item?.type ?? "admin");

  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    setRoles([]);
  }, [type]);

  useEffect(() => {
    const permissionRoles: string[] = [];
    if (item) {
      item?.inRoles.forEach((item) => {
        permissionRoles.push(item.role.name);
      });
    }
    setRoles(permissionRoles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function hasRole(role: RoleWithPermissions) {
    return permissionRoles.includes(role.name);
  }

  function setPermission(role: RoleWithPermissions, add: any) {
    if (add) {
      setRoles([...permissionRoles, role.name]);
    } else {
      setRoles(permissionRoles.filter((f) => f !== role.name));
    }
  }

  const filteredItems = () => {
    if (!roles.filter((f) => f.type === type)) {
      return [];
    }
    return roles
      .filter((f) => f.type === type)
      .filter(
        (f) =>
          f.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) || f.description?.toString().toUpperCase().includes(searchInput.toUpperCase())
      );
  };

  return (
    <FormGroup
      canDelete={(!item?.isDefault || appOrAdminData.isSuperAdmin) && canDelete}
      editing={canUpdate}
      id={item?.id}
      className="space-y-3 px-4 pb-4"
      onCancel={onCancel}
    >
      <div className="text-lg font-bold text-gray-900">Permission Details</div>

      <InputText disabled={!canUpdate} required name="name" title={t("models.role.name")} defaultValue={item?.name} />
      <InputText disabled={!canUpdate} required name="description" title={t("models.role.description")} defaultValue={item?.description} />
      <InputRadioGroup
        disabled={!canUpdate}
        name="type"
        title={t("models.permission.type")}
        value={type}
        setValue={setType}
        options={[
          {
            name: "Admin Permission",
            value: "admin",
          },
          {
            name: "App Permission",
            value: "app",
          },
        ]}
      />

      <div>
        <label className="flex justify-between space-x-2 truncate text-xs font-medium text-gray-600">
          <div className=" flex items-center justify-between space-x-1">
            <div className="text-lg font-bold text-gray-900">{t("models.role.plural")}</div>
          </div>
          <div>
            {filteredItems().length === permissionRoles.length ? (
              <ButtonTertiary disabled={!canUpdate} onClick={() => setRoles([])}>
                {t("shared.clear")}
              </ButtonTertiary>
            ) : (
              <ButtonTertiary disabled={!canUpdate} onClick={() => setRoles(filteredItems().map((f) => f.name))}>
                {t("shared.selectAll")}
              </ButtonTertiary>
            )}
          </div>
        </label>
        <InputSearch value={searchInput} setValue={setSearchInput} />
        <div className="mt-1">
          {permissionRoles.map((role) => {
            return <input key={role} type="hidden" name="roles[]" value={role} />;
          })}
          {filteredItems().map((role, idx) => {
            return (
              <InputCheckboxWithDescription
                disabled={!canUpdate}
                name={role.order + " " + role.name}
                title={<RoleBadge item={role} />}
                description={role.description}
                value={hasRole(role)}
                setValue={(e) => setPermission(role, e)}
                key={idx}
              />
            );
          })}
        </div>
      </div>

      <div className="border-border flex-shrink-0 border-t px-4 py-2 sm:px-6"></div>
    </FormGroup>
  );
}
