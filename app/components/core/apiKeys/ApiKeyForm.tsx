import { Tenant } from "@prisma/client";
import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DefaultEntityTypes } from "~/application/dtos/shared/DefaultEntityTypes";
import FormGroup from "~/components/ui/forms/FormGroup";
import InputCheckboxInline from "~/components/ui/input/InputCheckboxInline";
import InputDate from "~/components/ui/input/InputDate";
import InputSelect from "~/components/ui/input/InputSelect";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import { ApiKeyWithDetails } from "~/utils/db/apiKeys.db.server";
import { EntitySimple } from "~/utils/db/entities/entities.db.server";
import { updateItemByIdx } from "~/utils/shared/ObjectUtils";

interface Props {
  entities: EntitySimple[];
  item?: ApiKeyWithDetails | null;
  tenants?: Tenant[];
  canUpdate?: boolean;
  canDelete?: boolean;
}
export default function ApiKeyForm({ entities, item, tenants, canUpdate = true, canDelete }: Props) {
  const { t } = useTranslation();

  const inputName = useRef<RefInputText>(null);

  const [tenantId, setTenantId] = useState<string | number | undefined>(item?.tenantId ?? "");
  const [alias, setAlias] = useState(item?.alias ?? "");
  const [expires, setExpires] = useState<Date | undefined>(item?.expires ?? undefined);
  const [active, setActive] = useState(item?.active ?? true);
  const [permissions, setPermissions] = useState<{ entityId: string; create: boolean; read: boolean; update: boolean; delete: boolean }[]>([]);

  useEffect(() => {
    const permissions: { entityId: string; create: boolean; read: boolean; update: boolean; delete: boolean }[] = [];
    entities
      .filter((f) => (f.type === DefaultEntityTypes.AppOnly || f.type === DefaultEntityTypes.All) && f.hasApi)
      .forEach((entity) => {
        const existing = item?.entities.find((f) => f.entityId === entity.id);
        permissions.push({
          entityId: entity.id,
          create: existing?.create ?? true,
          read: existing?.read ?? true,
          update: existing?.update ?? true,
          delete: existing?.delete ?? true,
        });
      });
    setPermissions(permissions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTimeout(() => {
      inputName.current?.input.current?.focus();
    }, 100);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormGroup id={item?.id} editing={true} canUpdate={canUpdate} canDelete={canDelete}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        {tenants && (
          <>
            <InputSelect
              className="col-span-6"
              name="tenant-id"
              title={t("models.tenant.object")}
              value={tenantId}
              setValue={setTenantId}
              options={
                tenants?.map((tenant) => {
                  return {
                    name: tenant.name,
                    value: tenant.id,
                  };
                }) ?? []
              }
              disabled={tenants === undefined || !canUpdate}
            ></InputSelect>
          </>
        )}
        <InputText
          disabled={!canUpdate}
          ref={inputName}
          className="col-span-6"
          name="alias"
          title={t("models.apiKey.alias")}
          value={alias}
          setValue={setAlias}
          required
          autoComplete="off"
        />

        <InputDate
          disabled={!canUpdate}
          className="col-span-6"
          name="expires"
          title={t("models.apiKey.expires")}
          value={expires}
          onChange={setExpires}
          hint={
            <>
              {expires && (
                <button type="button" onClick={() => setExpires(undefined)} className="text-xs text-gray-600 hover:text-red-500">
                  {t("shared.remove")}
                </button>
              )}
            </>
          }
        />

        <div className="col-span-12 flex flex-col">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="overflow-hidden border border-gray-200 shadow sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="select-none truncate px-3 py-2 text-left text-xs font-medium tracking-wider text-gray-500">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <div>{t("models.entity.object")}</div>
                        </div>
                      </th>
                      <th scope="col" className="select-none truncate px-3 py-2 text-left text-xs font-medium tracking-wider text-gray-500">
                        {t("models.apiKey.create")}
                      </th>
                      <th scope="col" className="select-none truncate px-3 py-2 text-left text-xs font-medium tracking-wider text-gray-500">
                        {t("models.apiKey.read")}
                      </th>
                      <th scope="col" className="select-none truncate px-3 py-2 text-left text-xs font-medium tracking-wider text-gray-500">
                        {t("models.apiKey.update")}
                      </th>
                      <th scope="col" className="select-none truncate px-3 py-2 text-left text-xs font-medium tracking-wider text-gray-500">
                        {t("models.apiKey.delete")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {entities
                      .filter((f) => (f.type === DefaultEntityTypes.AppOnly || f.type === DefaultEntityTypes.All) && f.hasApi)
                      .map((item, idx) => {
                        return (
                          <tr key={idx}>
                            <input
                              type="hidden"
                              name="entities[]"
                              value={JSON.stringify({
                                entityId: item.id,
                                create: permissions.find((f) => f.entityId === item.id)?.create ?? false,
                                read: permissions.find((f) => f.entityId === item.id)?.read ?? false,
                                update: permissions.find((f) => f.entityId === item.id)?.update ?? false,
                                delete: permissions.find((f) => f.entityId === item.id)?.delete ?? false,
                              })}
                            />
                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-600">/{item.slug}</td>
                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-600">
                              <InputCheckboxInline
                                disabled={!canUpdate}
                                name=""
                                title=""
                                value={permissions.find((f) => f.entityId === item.id)?.create ?? false}
                                setValue={(e) =>
                                  updateItemByIdx(permissions, setPermissions, idx, {
                                    create: e,
                                  })
                                }
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-600">
                              <InputCheckboxInline
                                disabled={!canUpdate}
                                name=""
                                title=""
                                value={permissions.find((f) => f.entityId === item.id)?.read ?? false}
                                setValue={(e) =>
                                  updateItemByIdx(permissions, setPermissions, idx, {
                                    read: e,
                                  })
                                }
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-600">
                              <InputCheckboxInline
                                disabled={!canUpdate}
                                name=""
                                title=""
                                value={permissions.find((f) => f.entityId === item.id)?.update ?? false}
                                setValue={(e) =>
                                  updateItemByIdx(permissions, setPermissions, idx, {
                                    update: e,
                                  })
                                }
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-600">
                              <InputCheckboxInline
                                disabled={!canUpdate}
                                name=""
                                title=""
                                value={permissions.find((f) => f.entityId === item.id)?.delete ?? false}
                                setValue={(e) =>
                                  updateItemByIdx(permissions, setPermissions, idx, {
                                    delete: e,
                                  })
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <InputCheckboxInline
          disabled={!canUpdate}
          className="col-span-12"
          name="active"
          title={t("models.apiKey.active")}
          value={active}
          setValue={setActive}
        />
      </div>
    </FormGroup>
  );
}
