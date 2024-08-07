import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import XIcon from "~/components/ui/icons/XIcon";
import OrderListButtons from "~/components/ui/sort/OrderListButtons";
import TableSimple from "~/components/ui/tables/TableSimple";
import { EntityRelationshipWithDetails } from "~/utils/db/entities/entityRelationships.db.server";
import NumberUtils from "~/utils/shared/NumberUtils";

export default function EntityRelationshipsTable({
  items,
  editable,
}: {
  items: (EntityRelationshipWithDetails & { _count: { rows: number } })[];
  editable: boolean;
}) {
  const { t } = useTranslation();
  return (
    <TableSimple
      headers={[
        {
          name: "order",
          title: "Order",
          value: (_item, idx) => (
            <div>
              {/* {item.order} */}
              <OrderListButtons index={idx} items={items.map((f) => ({ ...f, order: f.order ?? 0 }))} editable={true} />
            </div>
          ),
        },
        {
          name: "type",
          title: "Type",
          value: (item) => (
            <Link to={item.id} className="font-medium underline">
              {t("shared.relationships." + item.type)}
            </Link>
          ),
          className: "w-full",
        },
        {
          name: "parent",
          title: "Parent",
          value: (item) => (
            <div>
              {t(item.parent.title)} {item.parentEntityView && <span className="text-xs italic text-gray-500">({item.parentEntityView.name})</span>}
            </div>
          ),
        },
        {
          name: "child",
          title: "Child",
          value: (item) => (
            <div>
              {t(item.child.title)} {item.childEntityView && <span className="text-xs italic text-gray-500">({item.childEntityView.name})</span>}
            </div>
          ),
        },
        {
          name: "count",
          title: "Count",
          value: (item) => <div>{NumberUtils.intFormat(item._count.rows)}</div>,
        },
        {
          name: "required",
          title: "Required",
          value: (item) => <div>{item.required ? <CheckIcon className="h-5 w-5 text-teal-500" /> : <XIcon className="h-5 w-5 text-gray-500" />}</div>,
        },
        {
          name: "cascade",
          title: "Cascade delete",
          value: (item) => <div>{item.cascade ? <CheckIcon className="h-5 w-5 text-teal-500" /> : <XIcon className="h-5 w-5 text-gray-500" />}</div>,
        },
        {
          name: "readOnly",
          title: "Read only",
          value: (item) => <div>{item.readOnly ? <CheckIcon className="h-5 w-5 text-teal-500" /> : <XIcon className="h-5 w-5 text-gray-500" />}</div>,
        },
        {
          name: "hiddenIfEmpty",
          title: "Hidden if empty",
          value: (item) => <div>{item.hiddenIfEmpty ? <CheckIcon className="h-5 w-5 text-teal-500" /> : <XIcon className="h-5 w-5 text-gray-500" />}</div>,
        },
        {
          name: "title",
          title: "Title",
          value: (item) => <div>{item.title}</div>,
        },
      ]}
      items={items}
      actions={[
        {
          title: t("shared.edit"),
          onClickRoute: (_, item) => item.id,
          hidden: () => !editable,
        },
      ]}
    ></TableSimple>
  );
}
