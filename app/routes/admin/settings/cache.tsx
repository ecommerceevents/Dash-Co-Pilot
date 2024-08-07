import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLocation, useNavigation, useSearchParams, useSubmit } from "@remix-run/react";
import { cache } from "~/utils/cache.server";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import TableSimple from "~/components/ui/tables/TableSimple";
import InputSearch from "~/components/ui/input/InputSearch";
import { Fragment, useEffect, useState } from "react";
import InputCombobox from "~/components/ui/input/InputCombobox";
import NumberUtils from "~/utils/shared/NumberUtils";
import ShowPayloadModalButton from "~/components/ui/json/ShowPayloadModalButton";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import DateCell from "~/components/ui/dates/DateCell";
import { adminGetAllTenantsIdsAndNames } from "~/utils/db/tenants.db.server";
import { adminGetAllUsersNames, UserWithNames } from "~/utils/db/users.db.server";
import toast from "react-hot-toast";
import RefreshIcon from "~/components/ui/icons/RefreshIcon";
import { useTranslation } from "react-i18next";

type CachedValue = {
  key: string;
  value: any;
  sizeMb: number;
  createdAt: Date;
  createdTime: number;
};
type LoaderData = {
  cachedValues: CachedValue[];
  allTenants: { id: string; name: string; slug: string }[];
  allUsers: UserWithNames[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const cachedValues: CachedValue[] = [];

  for (const key of cache.keys()) {
    if (cachedValues.find((x) => x.key === key)) {
      continue;
    }
    const value = cache.get(key);
    if (!value) {
      continue;
    }
    const sizeBytes = new TextEncoder().encode(JSON.stringify(value)).length;
    const sizeMb = sizeBytes / 1024 / 1024;
    const createdTime = value.metadata.createdTime;
    const createdAt = new Date(createdTime);
    const cachedValue = { key, value: value.value, sizeMb, createdAt, createdTime };
    cachedValues.push(cachedValue);
  }

  const allTenants = await adminGetAllTenantsIdsAndNames();
  const allUsers = await adminGetAllUsersNames();

  const data: LoaderData = {
    cachedValues,
    allTenants,
    allUsers,
  };

  return json(data);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "delete-key") {
    const key = form.get("key")?.toString() ?? "";
    cache.delete(key);
    return json({ success: "Key deleted" });
  } else if (action === "delete-all") {
    let keyCount = cache.size;
    cache.clear();
    return json({ success: "Cache cleared: " + keyCount + " keys deleted" });
  } else if (action === "delete-keys") {
    const keys = form.get("keys")?.toString() ?? "";
    const keysArray = keys.split(",");
    let keyCount = 0;
    for (const key of keysArray) {
      cache.delete(key);
      keyCount++;
    }
    return json({ success: "Keys deleted: " + keyCount });
  }
  return json({ error: "Invalid action" }, { status: 400 });
};

export default function AdminCacheRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<{ success?: string; error?: string }>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const location = useLocation();

  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState("");

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [keyGroups, setKeyGroups] = useState<{ value: string; count: number }[]>([]);

  useEffect(() => {
    const keyGroups: { [key: string]: number } = {};
    for (const key of data.cachedValues.map((f) => f.key)) {
      const keyGroup = key.split(":")[0];
      if (!keyGroups[keyGroup]) {
        keyGroups[keyGroup] = 0;
      }
      keyGroups[keyGroup]++;
    }
    const keyGroupsArray = Object.keys(keyGroups).map((key) => ({ value: key, count: keyGroups[key] }));
    setKeyGroups(keyGroupsArray);
  }, [data.cachedValues]);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  const filteredItems = () => {
    let items = data.cachedValues;
    if (selectedKeys.length) {
      items = items.filter((item) => selectedKeys.includes(item.key.split(":")[0]));
    }
    if (selectedTenants.length) {
      items = items.filter((item) => {
        const tenantIds = selectedTenants;
        for (const tenantId of tenantIds) {
          const tenant = data.allTenants.find((f) => f.id === tenantId);
          if (!tenant) {
            return false;
          }
          const { id, slug } = tenant;
          if (item.key.includes(":" + id) || item.key.includes(":" + slug)) {
            return true;
          }
        }
        return false;
      });
    }
    if (selectedUsers.length) {
      items = items.filter((item) => {
        const userIds = selectedUsers;
        for (const userId of userIds) {
          const user = data.allUsers.find((f) => f.id === userId);
          if (!user) {
            return false;
          }
          const { id } = user;
          if (item.key.includes(":" + id)) {
            return true;
          }
        }
        return false;
      });
    }
    if (searchInput) {
      items = items.filter(
        (item) =>
          item.key.toLowerCase().includes(searchInput.toLowerCase()) ||
          JSON.stringify(item.value ?? "")
            ?.toLowerCase()
            .includes(searchInput.toLowerCase())
      );
    }
    return items;
  };

  const sortedItems = () => {
    const items = filteredItems();
    const sortBy = searchParams.get("sort") ?? "-createdTime";
    const sortAsc = sortBy.startsWith("-");
    const sortKey = sortBy.replace("-", "");
    const sorted = items.sort((a, b) => {
      if (sortKey === "key") {
        return sortAsc ? a.key.localeCompare(b.key) : b.key.localeCompare(a.key);
      } else if (sortKey === "sizeMb") {
        return sortAsc ? a.sizeMb - b.sizeMb : b.sizeMb - a.sizeMb;
      } else if (sortKey === "createdTime") {
        return sortAsc ? a.createdTime - b.createdTime : b.createdTime - a.createdTime;
      }
      return 0;
    });
    return sorted;
  };

  const availableUsers = () => {
    let users = data.allUsers.filter((f) => {
      if (!data.cachedValues.find((item) => item.key.includes(":" + f.id))) {
        return false;
      }
      return true;
    });
    return users;
  };

  const availableTenants = () => {
    let tenants = data.allTenants.filter((f) => {
      if (!data.cachedValues.find((item) => item.key.includes(":" + f.id) || item.key.includes(":" + f.slug))) {
        return false;
      }
      return true;
    });
    return tenants;
  };

  function onDeleteAll() {
    const form = new FormData();
    form.set("action", "delete-all");
    submit(form, {
      method: "post",
    });
  }
  function onDelete(key: string) {
    const form = new FormData();
    form.set("action", "delete-key");
    form.set("key", key);
    submit(form, {
      method: "post",
    });
  }
  function onDeleteSelected(keys: string[]) {
    const form = new FormData();
    form.set("action", "delete-keys");
    form.set("keys", keys.join(","));
    submit(form, {
      method: "post",
    });
  }

  function getValue(item: CachedValue) {
    try {
      // if is array, count
      if (Array.isArray(item.value)) {
        return item.value.length + " items";
      } else if (typeof item.value === "object") {
        return Object.keys(item.value).length + " keys";
      }
    } catch {}
    return item.value;
  }
  return (
    <EditPageLayout
      title={`Cache: ${NumberUtils.intFormat(data.cachedValues.length)} keys, ${NumberUtils.decimalFormat(
        data.cachedValues.reduce((a, b) => a + b.sizeMb, 0),
        2
      )} MB`}
    >
      <div className="space-y-3">
        <div className="flex justify-between space-x-2">
          <InputSearch className="w-full flex-grow" value={searchInput} setValue={setSearchInput} />
          <ButtonSecondary to={location.pathname + location.search} isLoading={navigation.state !== "idle"}>
            <RefreshIcon className="h-4 w-4" />
          </ButtonSecondary>
        </div>

        <div className=" flex items-start space-x-4">
          <div className=" w-52 flex-shrink-0 space-y-2 p-1">
            <InputCombobox
              title="Key group"
              name="keyGroupBy"
              // prefix="Key group"
              selectPlaceholder="Select a key group"
              options={keyGroups.map((f) => ({ name: `${f.value} (${NumberUtils.intFormat(f.count)})`, value: f.value }))}
              value={selectedKeys}
              onChange={(value) => {
                setSelectedKeys(value as string[]);
              }}
              onClear={() => setSelectedKeys([])}
              disabled={keyGroups.length === 0}
              minDisplayCount={2}
            />
            <InputCombobox
              title="Tenant"
              name="tenants"
              // prefix="Tenant"
              selectPlaceholder="Select a tenant"
              options={availableTenants().map((f) => ({ name: f.name + " (" + f.slug + ")", value: f.id }))}
              value={selectedTenants}
              onChange={(value) => {
                setSelectedTenants(value as string[]);
              }}
              onClear={() => setSelectedTenants([])}
              disabled={availableTenants().length === 0}
              minDisplayCount={1}
            />
            <InputCombobox
              title="User"
              name="users"
              // prefix="User"
              selectPlaceholder="Select a user"
              options={availableUsers().map((f) => ({ name: f.email, value: f.id }))}
              value={selectedUsers}
              onChange={(value) => {
                setSelectedUsers(value as string[]);
              }}
              onClear={() => setSelectedUsers([])}
              disabled={availableUsers().length === 0}
              minDisplayCount={1}
            />
            <div className="border-border border-t pt-2">
              <DeleteButton items={sortedItems()} searchInput={searchInput} onDeleteAll={onDeleteAll} onDeleteSelected={onDeleteSelected} />
            </div>
          </div>
          <div className="flex-grow space-y-2 overflow-auto p-1">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Cached values</label>
              <TableSimple
                items={sortedItems()}
                noRecords={
                  <div className="flex flex-col space-y-1 py-4 text-sm">
                    <div>{t("shared.noRecords")}</div>
                    {searchInput && (
                      <div>
                        <button type="button" className="text-blue-500 underline" onClick={() => setSearchInput("")}>
                          Clear search
                        </button>
                      </div>
                    )}
                  </div>
                }
                headers={[
                  {
                    name: "key",
                    title: "Key",
                    value: (item) => <div className="max-w-xs truncate">{item.key}</div>,
                    sortBy: "key",
                    sortable: true,
                  },
                  {
                    name: "type",
                    title: "Type",
                    value: (item) => (Array.isArray(item.value) ? "array" : typeof item.value),
                  },
                  {
                    name: "value",
                    title: "Value",
                    value: (item) => (
                      <div className="flex justify-end">
                        <ShowPayloadModalButton description={getValue(item)} payload={item.value} />
                      </div>
                    ),
                  },
                  {
                    name: "size",
                    title: "Size",
                    value: (item) => <div>{NumberUtils.decimalFormat(item.sizeMb, 4)} MB</div>,
                    sortBy: "sizeMb",
                  },
                  {
                    name: "createdAt",
                    title: "Created at",
                    value: (item) => item.createdAt,
                    formattedValue: (item) => <DateCell date={item.createdAt} displays={["ymdhmsms"]} />,
                    sortBy: "createdTime",
                  },
                ]}
                actions={[
                  {
                    title: "Delete",
                    onClick: (_, item) => onDelete(item.key),
                    disabled: (item) => navigation.formData?.get("action") === "delete-key" && navigation.formData?.get("key") === item.key,
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </EditPageLayout>
  );
}

function DeleteButton({
  items,
  searchInput,
  onDeleteAll,
  onDeleteSelected,
}: {
  items: CachedValue[];
  searchInput: string;
  onDeleteAll: () => void;
  onDeleteSelected: (keys: string[]) => void;
}) {
  const navigation = useNavigation();
  return (
    <Fragment>
      {searchInput ? (
        <ButtonSecondary
          className="w-full"
          disabled={items.length === 0}
          destructive
          onClick={() => onDeleteSelected(items.map((f) => f.key))}
          isLoading={navigation.formData?.get("action") === "delete-selected"}
        >
          Clear {items.length} keys
        </ButtonSecondary>
      ) : (
        <ButtonSecondary
          disabled={items.length === 0}
          className="w-full"
          destructive
          onClick={() => onDeleteAll()}
          isLoading={navigation.formData?.get("action") === "delete-all"}
        >
          Clear {items.length} keys
        </ButtonSecondary>
      )}
    </Fragment>
  );
}
