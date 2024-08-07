import { AnalyticsPageView } from "@prisma/client";
import { useTranslation } from "react-i18next";
import DateCell from "../ui/dates/DateCell";
import TableSimple from "../ui/tables/TableSimple";

export default function AnalyticsPageViewsTable({ items }: { items: AnalyticsPageView[] }) {
  const { t } = useTranslation();
  return (
    <TableSimple
      items={items}
      headers={[
        {
          name: "url",
          title: t("analytics.url"),
          className: "w-full",
          value: (item) => (
            <div className="flex flex-col truncate">
              <div className="font-medium text-gray-800">{item.url}</div>
              <div className="text-gray-600">{item.route}</div>
            </div>
          ),
        },
        {
          name: "date",
          title: t("analytics.viewed"),
          value: (item) => <DateCell date={item.createdAt} />,
        },
      ]}
    />
  );
}
