import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors } from "~/application/enums/shared/Colors";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import FormGroup from "~/components/ui/forms/FormGroup";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import { GroupWithDetails } from "~/utils/db/permissions/groups.db.server";
import { TenantUserWithUser } from "~/utils/db/tenants.db.server";
import { getColors } from "~/utils/shared/ColorUtils";
import UserBadge from "../users/UserBadge";

interface Props {
  item?: GroupWithDetails | null;
  allUsers: TenantUserWithUser[];
  canUpdate?: boolean;
  canDelete?: boolean;
}
export default function GroupForm({ item, allUsers, canUpdate = true, canDelete }: Props) {
  const { t } = useTranslation();

  const inputName = useRef<RefInputText>(null);

  const [color, setColor] = useState<string | number | undefined>(item?.color);
  const [users, setUsers] = useState(item?.users?.map((f) => f.userId) ?? []);

  useEffect(() => {
    setTimeout(() => {
      inputName.current?.input.current?.focus();
    }, 100);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setUser(user: TenantUserWithUser, add: any) {
    if (add) {
      setUsers([...users, user.userId]);
    } else {
      setUsers(users.filter((f) => f !== user.userId));
    }
  }

  return (
    <FormGroup id={item?.id} editing={true} canUpdate={canUpdate} canDelete={canDelete}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        <InputText
          disabled={!canUpdate}
          ref={inputName}
          className="col-span-7"
          name="name"
          title={t("models.group.name")}
          defaultValue={item?.name}
          required
          autoComplete="off"
        />

        <InputSelector
          className="col-span-5"
          name="color"
          title={t("models.group.color")}
          withSearch={false}
          value={color}
          setValue={setColor}
          options={
            getColors().map((color) => {
              return {
                name: (
                  <div className="flex items-center space-x-2">
                    <ColorBadge color={color} />
                    <div>{t("app.shared.colors." + Colors[color])}</div>
                  </div>
                ),
                value: color,
              };
            }) ?? []
          }
        ></InputSelector>

        <InputText
          disabled={!canUpdate}
          className="col-span-12"
          name="description"
          title={t("models.group.description")}
          defaultValue={item?.description}
          autoComplete="off"
        />

        <div className="col-span-12 mt-2">
          <label className="flex justify-between space-x-2 truncate text-xs font-medium text-gray-600">
            <div className=" flex items-center justify-between space-x-1">
              <div className="text-sm font-bold text-gray-900">{t("models.user.plural")}</div>
            </div>
          </label>
          <div className="mt-1">
            {users.map((user) => {
              return <input key={user} type="hidden" name="users[]" value={user} />;
            })}
            {allUsers.map((user, idx) => {
              return (
                <InputCheckboxWithDescription
                  disabled={!canUpdate}
                  name={user.userId}
                  title={<UserBadge item={user.user} />}
                  description={""}
                  value={users.includes(user.userId)}
                  setValue={(e) => setUser(user, e)}
                  key={idx}
                />
              );
            })}
          </div>
        </div>
      </div>
    </FormGroup>
  );
}
