import { useTranslation } from "react-i18next";
import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { getTranslations } from "~/locale/i18next.server";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import TableSimple from "~/components/ui/tables/TableSimple";
import { getPaginationFromCurrentUrl } from "~/utils/helpers/RowPaginationHelper";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import DateUtils from "~/utils/shared/DateUtils";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { IpAddress } from "@prisma/client";
import { getAllIpAddresses } from "~/modules/ipAddress/db/ipAddresses.db.server";
import ShowPayloadModalButton from "~/components/ui/json/ShowPayloadModalButton";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { findInBlacklist, addToBlacklist } from "~/utils/db/blacklist.db.server";
import { useSubmit } from "@remix-run/react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { db } from "~/utils/db.server";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import { Colors } from "~/application/enums/shared/Colors";
import { clearCacheKey } from "~/utils/cache.server";

type LoaderData = {
  title: string;
  items: IpAddress[];
  pagination: PaginationDto;
  blacklistedIps: string[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verifyUserHasPermission(request, "admin.tenantIpAddress.view");
  const { t } = await getTranslations(request);

  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await getAllIpAddresses(currentPagination);

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
  } else if (action === "delete-ip") {
    const id = form.get("id")?.toString() ?? "";
    await db.ipAddress.delete({ where: { id } }).then((item) => {
      clearCacheKey(`ipAddress:${item.ip}`);
    });
    return json({ success: "IP address has been deleted." });
  } else {
    return json({ error: "Invalid action." }, { status: 400 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function IpAddresses() {
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<{ success?: string; error?: string }>();
  const submit = useSubmit();
  const { t } = useTranslation();

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
    >
      <TableSimple
        items={data.items}
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
              const form = new FormData();
              form.set("action", "delete-ip");
              form.set("id", i.id);
              submit(form, {
                method: "post",
              });
            },
          },
        ]}
        headers={[
          {
            name: "ip",
            title: t("models.tenantIpAddress.object"),
            value: (i) => (
              <div className="flex flex-col">
                <div className="font-medium">
                  {i.ip} {i.type && <span className="text-xs font-light text-gray-600">({i.type})</span>}{" "}
                  {data.blacklistedIps.includes(i.ip) && <SimpleBadge title="Blacklisted" color={Colors.RED} />}
                </div>
                <div className="text-xs text-gray-600">{i.provider}</div>
              </div>
            ),
          },
          {
            name: "country",
            title: "Country",
            value: (i) => (
              <div className="flex flex-col">
                <div className="font-medium">{i.countryCode}</div>
                <div className="text-xs text-gray-600">{i.countryName}</div>
              </div>
            ),
          },
          {
            name: "region",
            title: "Region",
            value: (i) => (
              <div className="flex flex-col">
                <div className="font-medium">{i.regionCode}</div>
                <div className="text-xs text-gray-600">{i.regionName}</div>
              </div>
            ),
          },
          {
            name: "city",
            title: "City",
            value: (i) => (
              <div className="flex flex-col">
                <div className="font-medium">{i.city}</div>
                <div className="text-xs text-gray-600">{i.zipCode}</div>
              </div>
            ),
          },
          {
            name: "metadata",
            title: "Metadata",
            value: (i) => <div className="max-w-xs truncate">{i.metadata && <ShowPayloadModalButton description={i.metadata} payload={i.metadata} />}</div>,
          },
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (item) => DateUtils.dateAgo(item.createdAt),
            className: "text-gray-400 text-xs",
            breakpoint: "sm",
          },
        ]}
        pagination={data.pagination}
      />
    </EditPageLayout>
  );
}
