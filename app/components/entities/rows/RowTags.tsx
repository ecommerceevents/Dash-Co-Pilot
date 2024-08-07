import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Link } from "@remix-run/react";
import PlusIcon from "~/components/ui/icons/PlusIcon";
import TagFilledIcon from "~/components/ui/icons/TagFilledIcon";
import XIcon from "~/components/ui/icons/XIcon";
import { RowTagWithDetails } from "~/utils/db/entities/rowTags.db.server";
import { getBackgroundColor } from "~/utils/shared/ColorUtils";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";

interface Props {
  items: RowTagWithDetails[];
  onRemove?: (item: RowTagWithDetails) => void;
  onSetTagsRoute?: string;
}

export default function RowTags({ items, onRemove, onSetTagsRoute }: Props) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();

  const sortedItems = () => {
    return items.slice().sort((x, y) => {
      if (x.tag.id && y.tag.id) {
        return (x.tag.id > y.tag.id ? -1 : 1) ?? -1;
      }
      return -1;
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <h3 className="text-sm font-medium leading-3 text-gray-800">
          <div className="flex items-center space-x-1">
            <TagFilledIcon className="h-4 w-4 text-gray-400" />
            <div>
              <span className=" font-light italic"></span> {t("models.tag.plural")}
            </div>
          </div>
        </h3>
        {items.length > 0 && appOrAdminData.user !== undefined && onSetTagsRoute && (
          <div className="inline text-xs">
            <Link to={onSetTagsRoute} className="flex items-center space-x-1 text-sm text-gray-500 hover:underline">
              <PlusIcon className="h-3 w-3" />
              <div>{t("shared.setTags")}</div>
            </Link>
          </div>
        )}
      </div>

      {items.length === 0 && (
        <>
          {appOrAdminData.user && onSetTagsRoute ? (
            <Link
              to={onSetTagsRoute}
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <span className="block text-xs font-normal text-gray-500">{t("shared.noTags")}</span>
            </Link>
          ) : (
            <div className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center">
              <span className="block text-xs font-normal text-gray-500">{t("shared.noTags")}</span>
            </div>
          )}
        </>
      )}
      <ul className="leading-8">
        {sortedItems().map((item) => {
          return (
            <li key={item.tag.value} className="inline select-none p-0.5">
              <span className="relative inline-flex items-center rounded-full border border-gray-300 px-3 py-0.5">
                <div className="absolute flex flex-shrink-0 items-center justify-center">
                  <span className={clsx("h-1.5 w-1.5 rounded-full", getBackgroundColor(item.tag.color))} aria-hidden="true" />
                </div>
                <div className="ml-3.5 text-sm font-medium text-gray-900">{item.tag.value}</div>
                {onRemove && (
                  <div className="absolute flex flex-shrink-0 items-center justify-center">
                    <XIcon className="h-3 w-3"></XIcon>
                  </div>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
