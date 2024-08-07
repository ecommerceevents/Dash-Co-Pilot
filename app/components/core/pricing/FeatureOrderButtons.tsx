import clsx from "clsx";
import { SubscriptionFeatureDto } from "~/application/dtos/subscriptions/SubscriptionFeatureDto";

interface Props {
  index: number | undefined;
  items: SubscriptionFeatureDto[];
  onChange: (items: SubscriptionFeatureDto[]) => void;
  editable?: boolean;
}

export default function FeatureOrderButtons({ index, items, editable = true, onChange }: Props) {
  function changeOrder(forward: boolean) {
    if (index === undefined) {
      return;
    }
    const currentItem = items[index];
    let nextItem: SubscriptionFeatureDto | undefined = undefined;
    let prevItem: SubscriptionFeatureDto | undefined = undefined;
    if (forward) {
      if (items.length > index + 1) {
        nextItem = items[index + 1];
      }
    } else {
      if (index - 1 >= 0) {
        prevItem = items[index - 1];
      }
    }
    const newItems = [...items];
    newItems.forEach((item, idx) => {
      let order = 0;
      if (currentItem === item) {
        order = idx + (forward ? 1 : -1) + 1;
      } else if (prevItem === item) {
        order = idx + (forward ? 0 : 1) + 1;
      } else if (nextItem === item) {
        order = idx + (forward ? -1 : 0) + 1;
      } else {
        order = idx + 1;
      }
      item.order = order;
    });
    onChange(newItems);
  }
  function isLastItem() {
    return index === items.length - 1;
    // const maxOrder = Math.max(...items.map((o) => o.order));
    // return order === maxOrder;
  }
  return (
    <>
      {index !== undefined && (
        <div className="flex items-center space-x-1 truncate">
          {items[index].order}

          <button
            type="button"
            onClick={() => changeOrder(false)}
            className={clsx(
              index <= 0 || !editable ? " cursor-not-allowed bg-gray-100 text-gray-300" : "hover:bg-gray-100 hover:text-gray-800",
              "h-4 w-4 bg-gray-50 px-0.5 py-0.5 text-gray-500 focus:outline-none"
            )}
            disabled={index <= 0 || !editable}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => changeOrder(true)}
            className={clsx(
              isLastItem() || !editable ? " cursor-not-allowed bg-gray-100 text-gray-300" : "hover:bg-gray-100 hover:text-gray-800",
              "h-4 w-4 bg-gray-50 px-0.5 py-0.5 text-gray-500 focus:outline-none"
            )}
            disabled={isLastItem() || !editable}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
