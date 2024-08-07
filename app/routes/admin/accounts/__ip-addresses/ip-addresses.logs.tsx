import { useTranslation } from "react-i18next";
import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import DateUtils from "~/utils/shared/DateUtils";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { IpAddressLog } from "@prisma/client";
import { getAllIpAddressLogs } from "~/modules/ipAddress/db/ipAddressLogs.db.server";
import ShowPayloadModalButton from "~/components/ui/json/ShowPayloadModalButton";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import { Colors } from "~/application/enums/shared/Colors";
import { addToBlacklist, findInBlacklist } from "~/utils/db/blacklist.db.server";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSubmit } from "@remix-run/react";
import { db } from "~/utils/db.server";
import DropdownSimple from "~/components/ui/dropdowns/DropdownSimple";
import DownArrow from "~/components/ui/icons/DownArrow";

type LoaderData = {
  title: string;
  items: IpAddressLog[];
  pagination: PaginationDto;
  blacklistedIps: string[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.tenantIpAddress.view");
  const { t } = await getTranslations(request);

  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await getAllIpAddressLogs(currentPagination);

  const data: LoaderData = {
    title: `${t("models.ipAddress.plural")} | ${process.env.APP_NAME}`,
    items,
    pagination,
    blacklistedIps: await db.blacklist
      .findMany({
        where: { type: "ip" },
        select: { value: true },
      })
      .then((items) => items.flatMap((i) => i.value)),
  };
  return json(data);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const action = form.get("action") as string;
  if (action === "blacklist-ip") {
    const ip = form.get("ip")?.toString() ?? "";
    const existing = await findInBlacklist("ip", ip);
    if (existing) {
      return json({ error: "IP address is already blacklisted." }, { status: 400 });
    } else {
      await addToBlacklist({
        type: "ip",
        value: ip,
      });
      return json({ success: "IP address has been blacklisted." });
    }
  } else if (action === "delete-log") {
    const id = form.get("id")?.toString() ?? "";
    await db.ipAddressLog.delete({ where: { id } });
    return json({ success: "Log has been deleted." });
  } else if (action === "delete-logs") {
    const ids = form.getAll("id").map((i) => i.toString());
    const deleted = await db.ipAddressLog.deleteMany({ where: { id: { in: ids } } });
    return json({ success: `${deleted.count} logs have been deleted.` });
  } else {
    return json({ error: "Invalid action." }, { status: 400 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<{ success?: string; error?: string }>();
  const submit = useSubmit();
  const { t } = useTranslation();

  const [items, setItems] = useState<IpAddressLog[]>(data.items);
  const [selected, setSelected] = useState<IpAddressLog[]>([]);

  useEffect(() => {
    setItems(data.items);
  }, [data]);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);
  return (
    <EditPageLayout
      tabs={[
        {
          name: "IP Addresses",
          routePath: "/admin/accounts/ip-addresses",
        },
        {
          name: "Logs",
          routePath: "/admin/accounts/ip-addresses/logs",
        },
      ]}
      buttons={<></>}
    >
      {selected.length > 0 && (
        <DropdownSimple
          right
          button={
            <div className="flex items-center space-x-2 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 hover:bg-gray-50">
              <div>{selected.length} selected</div>
              <DownArrow className="h-4 w-4" />
            </div>
          }
          items={[
            {
              label: `Delete ${selected.length} logs`,
              onClick: () => {
                const form = new FormData();
                form.set("action", "delete-logs");
                selected.forEach((i) => form.append("id", i.id));
                setSelected([]);
                setItems((prev) => prev.filter((p) => !selected.includes(p)));
                submit(form, {
                  method: "post",
                });
              },
            },
          ]}
        />
      )}
      <TableSimple
        items={items}
        selectedRows={selected}
        onSelected={setSelected}
        actions={[
          {
            title: "Blacklist IP",
            destructive: true,
            onClick: (_, i) => {
              const form = new FormData();
              form.set("action", "blacklist-ip");
              form.set("ip", i.ip);
              submit(form, {
                method: "post",
              });
            },
          },
          {
            title: "Delete",
            destructive: true,
            onClick: (_, i) => {
              setSelected((prev) => prev.filter((p) => p.id !== i.id));
              setItems((prev) => prev.filter((p) => p.id !== i.id));
              const form = new FormData();
              form.set("action", "delete-log");
              form.set("id", i.id);
              submit(form, {
                method: "post",
              });
            },
          },
        ]}
        headers={[
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (item) => DateUtils.dateAgo(item.createdAt),
            className: "text-gray-400 text-xs",
            breakpoint: "sm",
          },
          {
            name: "status",
            title: t("shared.status"),
            value: (i) => (
              <div className="flex flex-col">
                <div>{i.success ? <SimpleBadge title="Success" color={Colors.GREEN} /> : <SimpleBadge title="Error" color={Colors.RED} />}</div>
              </div>
            ),
          },
          {
            name: "ip",
            title: t("models.tenantIpAddress.object"),
            value: (i) => (
              <div className="flex flex-col">
                <div className="font-medium">
                  {i.ip} {data.blacklistedIps.includes(i.ip) && <SimpleBadge title="Blacklisted" color={Colors.RED} />}
                </div>
              </div>
            ),
          },
          {
            name: "action",
            title: "Action",
            value: (i) => (
              <div className="flex flex-col">
                <div className="font-medium">{i.action}</div>
                <div className="text-xs text-gray-600">{i.description}</div>
              </div>
            ),
          },
          {
            name: "url",
            title: "URL",
            value: (i) => (
              <div className="flex flex-col">
                <div className="">{i.url}</div>
              </div>
            ),
          },
          {
            name: "metadata",
            title: "Metadata",
            value: (i) => (
              <div className="max-w-xs truncate">
                {i.metadata ? <ShowPayloadModalButton description={i.metadata} payload={i.metadata} /> : <div className="italic text-gray-500">-</div>}
              </div>
            ),
          },
          {
            name: "error",
            title: "Error",
            value: (i) => (
              <div className="flex flex-col text-red-500">
                <div className="font-medium">{i.error}</div>
              </div>
            ),
          },
        ]}
        pagination={data.pagination}
      />
    </EditPageLayout>
  );
}
