import clsx from "clsx";
import { useTranslation } from "react-i18next";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import ExclamationTriangleIcon from "~/components/ui/icons/ExclamationTriangleIcon";
import XIcon from "~/components/ui/icons/XIcon";
import TableSimple from "~/components/ui/tables/TableSimple";
import { NotificationChannelDto, NotificationChannels } from "../services/NotificationChannels";
import { IGetTemplatesData } from "../services/.server/NotificationService";

export default function NotificationTemplatesTable({
  items,
  onDelete,
  onSendPreview,
}: {
  items: IGetTemplatesData | null;
  onDelete: (id: string) => void;
  onSendPreview: (item: NotificationChannelDto) => void;
}) {
  const { t } = useTranslation();
  function getCreated(i: NotificationChannelDto) {
    return items?.data.find((f) => f.name === i.name);
  }
  function isValid(item: NotificationChannelDto, templates: IGetTemplatesData | null) {
    const existing = templates?.data.find((f) => f.name === item.name);
    if (!existing || !existing.steps || existing.steps.length === 0) {
      return false;
    }
    return true;
  }
  return (
    <TableSimple
      items={NotificationChannels}
      pagination={{
        page: (items?.page ?? 0) + 1,
        pageSize: items?.pageSize ?? 0,
        totalItems: items?.totalCount ?? 0,
        totalPages: Math.ceil((items?.totalCount ?? 0) / (items?.pageSize ?? 0)),
      }}
      headers={[
        {
          name: "name",
          title: "Name",
          value: (i) => (
            <>
              {!isValid(i, items) ? (
                <div className="flex items-center space-x-1 text-red-600">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                  <div>{i.name}</div>
                </div>
              ) : (
                <div>{i.name}</div>
              )}
            </>
          ),
        },
        {
          name: "description",
          title: "Description",
          className: "w-full",
          value: (i) => (
            <div className="max-w-xs overflow-x-auto text-gray-600">
              <div className={clsx(!isValid(i, items) && "text-red-600")}>{i.description}</div>
            </div>
          ),
        },
        {
          name: "roles",
          title: "Sends to roles",
          value: (i) => <div className="text-gray-600">{i.roles?.map((f) => f).join(", ")}</div>,
        },
        {
          name: "send",
          title: t("shared.preview"),
          value: (i) => (
            <div>
              <button
                type="button"
                className={clsx(
                  "font-medium",
                  getCreated(i)?.active ? "border-theme-300 border-b border-dashed hover:border-dotted" : "cursor-not-allowed bg-opacity-90"
                )}
                onClick={() => onSendPreview(i)}
              >
                {t("shared.send")}
              </button>
            </div>
          ),
        },
        {
          name: "active",
          title: "Active",
          value: (i) => <div>{getCreated(i)?.active ? <CheckIcon className="text-theme-500 h-4 w-4" /> : <XIcon className="h-4 w-4 text-gray-500" />}</div>,
        },
        {
          name: "hasSteps",
          title: "Has steps",
          value: (i) => (
            <div>{(getCreated(i)?.steps ?? []).length > 0 ? <CheckIcon className="text-theme-500 h-4 w-4" /> : <XIcon className="h-4 w-4 text-red-600" />}</div>
          ),
        },
        // {
        //   name: "tags",
        //   title: "Tags",
        //   value: (i) =>
        //     getCreated(i)
        //       ?.tags.map((f) => f)
        //       .join(", "),
        // },
        {
          name: "_id",
          title: "_id",
          value: (i) => (
            <>
              {getCreated(i)?._id ? (
                <a
                  href={`https://web.novu.co/templates/edit/${getCreated(i)?._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:border-dotter hover:border-theme-300 border-b border-dashed border-gray-300"
                >
                  {getCreated(i)?._id}
                </a>
              ) : (
                <a
                  href={"https://web.novu.co/templates/create"}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:border-dotter hover:border-theme-300 border-b border-dashed border-gray-300"
                >
                  {t("shared.create")}
                </a>
              )}
            </>
          ),
        },
        // {
        //   name: "delete",
        //   title: "Delete",
        //   value: (i) => (
        //     <div className="flex items-center justify-center">
        //       {i._id !== undefined && (
        //         <button
        //           type="button"
        //           onClick={() => onDelete(i._id ?? "")}
        //           className="mr-2 flex h-4 w-4 items-center justify-center text-gray-600 hover:text-red-600"
        //         >
        //           <TrashIcon className="h-4 w-4" />
        //         </button>
        //       )}
        //     </div>
        //   ),
        // },
      ]}
    ></TableSimple>
  );
}
