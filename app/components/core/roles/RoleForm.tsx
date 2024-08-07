import InputText from "~/components/ui/input/InputText";
import { useTranslation } from "react-i18next";
import { RoleWithPermissions } from "~/utils/db/permissions/roles.db.server";
import { PermissionWithRoles } from "~/utils/db/permissions/permissions.db.server";
import InputCheckboxInline from "~/components/ui/input/InputCheckboxInline";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import { useEffect, useState } from "react";
import FormGroup from "~/components/ui/forms/FormGroup";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import InputRadioGroup from "~/components/ui/input/InputRadioGroup";
import InputSearch from "~/components/ui/input/InputSearch";

interface Props {
  item?: RoleWithPermissions;
  permissions: PermissionWithRoles[];
  onCancel: () => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function RoleForm({ item, permissions, onCancel, canUpdate = true, canDelete }: Props) {
  const { t } = useTranslation();

  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [type, setType] = useState<string | number | undefined>(item?.type ?? "admin");
  const [assignToNewUsers, setAssignToNewUsers] = useState(item?.assignToNewUsers ?? false);

  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    setRolePermissions([]);
  }, [type]);

  useEffect(() => {
    const rolePermissions: string[] = [];
    if (item) {
      item?.permissions.forEach((item) => {
        rolePermissions.push(item.permission.name);
      });
    }
    setRolePermissions(rolePermissions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function hasPermission(permission: PermissionWithRoles) {
    return rolePermissions.includes(permission.name);
  }

  function setPermission(permission: PermissionWithRoles, add: any) {
    if (add) {
      setRolePermissions([...rolePermissions, permission.name]);
    } else {
      setRolePermissions(rolePermissions.filter((f) => f !== permission.name));
    }
  }

  const filteredItems = () => {
    if (!permissions.filter((f) => f.type === type)) {
      return [];
    }
    return permissions
      .filter((f) => f.type === type)
      .filter(
        (f) =>
          f.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) || f.description?.toString().toUpperCase().includes(searchInput.toUpperCase())
      );
  };

  return (
    <FormGroup canDelete={!item?.isDefault && canDelete} editing={canUpdate} id={item?.id} className="space-y-3 px-4 pb-4" onCancel={onCancel}>
      <div className="text-lg font-bold text-gray-900">Role Details</div>

      <InputText disabled={!canUpdate} required name="name" title={t("models.role.name")} defaultValue={item?.name} />
      <InputText disabled={!canUpdate} required name="description" title={t("models.role.description")} defaultValue={item?.description} />
      <InputCheckboxInline
        disabled={!canUpdate}
        description={<span className="pl-1 font-light text-gray-500"> - Every new user will have this role</span>}
        name="assign-to-new-users"
        title={t("models.role.assignToNewUsers")}
        value={assignToNewUsers}
        setValue={setAssignToNewUsers}
      />
      <InputRadioGroup
        name="type"
        title={t("models.role.type")}
        value={type}
        setValue={setType}
        options={[
          {
            name: "Admin Role",
            value: "admin",
          },
          {
            name: "App Role",
            value: "app",
          },
        ]}
      />

      <div>
        <label className="flex justify-between space-x-2 truncate text-xs font-medium text-gray-600">
          <div className=" flex items-center justify-between space-x-1">
            <div className="text-lg font-bold text-gray-900">{t("models.role.permissions")}</div>
          </div>
          <div>
            {filteredItems().filter((f) => f.type === type).length === rolePermissions.length ? (
              <ButtonTertiary disabled={!canUpdate} onClick={() => setRolePermissions([])}>
                Clear
              </ButtonTertiary>
            ) : (
              <ButtonTertiary disabled={!canUpdate} onClick={() => setRolePermissions(filteredItems().map((f) => f.name))}>
                Select all
              </ButtonTertiary>
            )}
          </div>
        </label>
        <InputSearch value={searchInput} setValue={setSearchInput} />
        <div className="mt-1">
          {rolePermissions.map((permission) => {
            return <input key={permission} type="hidden" name="permissions[]" value={permission} />;
          })}
          {filteredItems().map((permission, idx) => {
            return (
              <InputCheckboxWithDescription
                disabled={!canUpdate}
                name={permission.order + " " + permission.name}
                title={permission.description}
                description={permission.name}
                value={hasPermission(permission)}
                setValue={(e) => setPermission(permission, e)}
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
