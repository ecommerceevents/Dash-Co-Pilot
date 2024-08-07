import { clsx } from "clsx";
import { RowTagWithDetails } from "~/utils/db/entities/rowTags.db.server";
import { getBackgroundColor } from "~/utils/shared/ColorUtils";

export default function RowTagsCell({ items }: { items: RowTagWithDetails[] }) {
  return (
    <div>
      {items?.map((rowTag) => {
        return (
          <div
            key={rowTag.id}
            className="relative mx-0.5 inline-flex max-w-sm select-none items-center space-x-0.5 overflow-x-auto rounded-full border border-gray-300 bg-gray-50 px-2 py-0.5"
          >
            <div className="absolute flex flex-shrink-0 items-center justify-center">
              <span className={clsx("h-1.5 w-1.5 rounded-full", getBackgroundColor(rowTag.tag.color))} aria-hidden="true" />
            </div>
            <div className="pl-2 text-xs font-medium text-gray-600">{rowTag.tag.value}</div>
          </div>
        );
      })}
    </div>
  );
}
