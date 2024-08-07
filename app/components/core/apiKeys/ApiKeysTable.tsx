import clsx from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DefaultEntityTypes } from "~/application/dtos/shared/DefaultEntityTypes";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import InputSearch from "~/components/ui/input/InputSearch";
import { ApiKeyWithDetails } from "~/utils/db/apiKeys.db.server";
import { EntitySimple } from "~/utils/db/entities/entities.db.server";
import DateUtils from "~/utils/shared/DateUtils";
import NumberUtils from "~/utils/shared/NumberUtils";

interface Props {
  entities: EntitySimple[];
  items: ApiKeyWithDetails[];
  withTenant?: boolean;
  canCreate?: boolean;
}
type Header = {
  name?: string;
  title: string;
};
export default function ApiKeysTable({ entities, items, withTenant, canCreate }: Props) {
  const { t } = useTranslation();

  const [copiedKey, setCopiedKey] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [headers, setHeaders] = useState<Header[]>([]);

  useEffect(() => {
    const headers: Header[] = [];
    if (withTenant) {
      headers.push({ name: "tenant", title: t("models.tenant.object") });
    }
    headers.push({ name: "key", title: t("models.apiKey.key") });
    headers.push({ name: "alias", title: t("models.apiKey.alias") });
    headers.push({ name: "usage", title: t("models.apiKey.usage") });
    entities
      .filter((f) => (f.type === DefaultEntityTypes.AppOnly || f.type === DefaultEntityTypes.All) && f.hasApi)
      .forEach((entity) => {
        headers.push({ name: "entityId", title: t(entity.titlePlural) });
      });
    headers.push({ name: "expires", title: t("models.apiKey.expires") });
    headers.push({ name: "createdAt", title: t("shared.createdAt") });
    headers.push({ name: "createdByUser", title: t("shared.createdBy") });
    setHeaders(headers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withTenant]);

  const filteredItems = () => {
    if (!items) {
      return [];
    }
    const filtered = items.filter((f) => f.tenant?.name?.toString()?.toUpperCase().includes(searchInput.toUpperCase()));

    return filtered.sort((x, y) => {
      if (x.createdAt && y.createdAt) {
        return (x.createdAt > y.createdAt ? -1 : 1) ?? -1;
      }
      return -1;
    });
  };

  // function deleteApiKey(item: ApiKey) {
  //   if (confirmDelete.current) {
  //     confirmDelete.current.setValue(item);
  //     confirmDelete.current.show(t("shared.delete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  //   }
  // }
  // function confirmDeleteApiKey(item: ApiKey) {
  //   const form = new FormData();
  //   form.set("action", "delete");
  //   form.set("id", item.id);
  //   submit(form, {
  //     method: "post",
  //   });
  // }

  function getEntityPermissions(item: ApiKeyWithDetails, entity: EntitySimple, permission: string) {
    const apiKeyEntity = item.entities.find((f) => f.entityId === entity.id);
    if (apiKeyEntity) {
      if (permission === "C") {
        return apiKeyEntity.create;
      }
      if (permission === "R") {
        return apiKeyEntity.read;
      }
      if (permission === "U") {
        return apiKeyEntity.update;
      }
      if (permission === "D") {
        return apiKeyEntity.delete;
      }
    }
    return false;
  }

  function hasExpired(item: ApiKeyWithDetails) {
    const now = new Date();
    return item.expires && item.expires < now;
  }

  return (
    <div className="space-y-2">
      <InputSearch value={searchInput} setValue={setSearchInput} onNewRoute={canCreate ? "new" : ""} />
      {(() => {
        if (filteredItems().length === 0) {
          return (
            <div>
              <EmptyState
                className="bg-white"
                captions={{
                  thereAreNo: t("shared.noRecords"),
                }}
              />
            </div>
          );
        } else {
          return (
            <div>
              <div>
                <div className="flex flex-col">
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full py-2 align-middle">
                      <div className="overflow-hidden border border-gray-200 shadow sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {headers.map((header, idx) => {
                                return (
                                  <th
                                    key={idx}
                                    scope="col"
                                    className="select-none truncate px-3 py-2 text-left text-xs font-medium tracking-wider text-gray-500"
                                  >
                                    <div className="flex items-center space-x-1 text-gray-500">
                                      <div>{header.title}</div>
                                    </div>
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredItems().map((item, idx) => {
                              return (
                                <tr key={idx}>
                                  {withTenant && <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-600">{item.tenant?.name ?? "- Admin -"}</td>}
                                  <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-600">
                                    {item.active ? (
                                      <ButtonTertiary
                                        onClick={() => {
                                          setCopiedKey(item.key);
                                          setTimeout(() => {
                                            setCopiedKey("");
                                          }, 2000);
                                          navigator.clipboard.writeText(item.key);
                                        }}
                                      >
                                        {copiedKey === item.key ? t("shared.copied") : t("shared.copy")}
                                      </ButtonTertiary>
                                    ) : (
                                      <span className="text-red-600">{t("shared.inactive")} </span>
                                    )}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-600">{item.alias}</td>
                                  <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-600">
                                    {NumberUtils.intFormat(item._count.apiKeyLogs)}{" "}
                                    {item._count.apiKeyLogs === 1 ? t("models.apiCall.object") : t("models.apiCall.plural")}
                                  </td>
                                  {entities
                                    .filter((f) => (f.type === DefaultEntityTypes.AppOnly || f.type === DefaultEntityTypes.All) && f.hasApi)
                                    .map((entity) => {
                                      return (
                                        <td key={entity.id} className="whitespace-nowrap px-3 py-2 text-sm text-gray-600">
                                          <div className="flex items-center">
                                            <span className={clsx(getEntityPermissions(item, entity, "C") ? " font-bold text-gray-800" : "text-red-400")}>
                                              C
                                            </span>
                                            <span className={clsx(getEntityPermissions(item, entity, "R") ? " font-bold text-gray-800" : "text-red-400")}>
                                              R
                                            </span>
                                            <span className={clsx(getEntityPermissions(item, entity, "U") ? " font-bold text-gray-800" : "text-red-400")}>
                                              U
                                            </span>
                                            <span className={clsx(getEntityPermissions(item, entity, "D") ? " font-bold text-gray-800" : "text-red-400")}>
                                              D
                                            </span>
                                          </div>
                                        </td>
                                      );
                                    })}
                                  <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-600">
                                    <time dateTime={DateUtils.dateYMDHMS(item.expires)} title={DateUtils.dateYMDHMS(item.expires)}>
                                      {item.expires === null ? (
                                        <span>-</span>
                                      ) : (
                                        <span className={clsx(hasExpired(item) ? "" : "")}>{DateUtils.dateAgo(item.expires)}</span>
                                      )}
                                    </time>
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-600">
                                    <time dateTime={DateUtils.dateYMDHMS(item.createdAt)} title={DateUtils.dateYMDHMS(item.createdAt)}>
                                      {DateUtils.dateYMDHMS(item.createdAt)}
                                    </time>
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-600">
                                    <span className="text-xs text-gray-400">{item.createdByUser.email}</span>
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                      <ButtonTertiary to={item.id}>{t("shared.edit")}</ButtonTertiary>
                                    </div>
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
              </div>
            </div>
          );
        }
      })()}
    </div>
  );
}
