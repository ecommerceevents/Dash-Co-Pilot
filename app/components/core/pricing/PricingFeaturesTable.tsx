import { Menu } from "@headlessui/react";
import clsx from "clsx";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { SubscriptionFeatureDto } from "~/application/dtos/subscriptions/SubscriptionFeatureDto";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { InputType } from "~/application/enums/shared/InputType";
import { SubscriptionFeatureLimitType } from "~/application/enums/subscriptions/SubscriptionFeatureLimitType";
import Dropdown from "~/components/ui/dropdowns/Dropdown";
import DocumentDuplicateIcon from "~/components/ui/icons/DocumentDuplicateIcon";
import TrashEmptyIcon from "~/components/ui/icons/TrashEmptyIcon";
import TableSimple from "~/components/ui/tables/TableSimple";
import { updateItemByIdx } from "~/utils/shared/ObjectUtils";

interface Props {
  plans: SubscriptionProductDto[] | undefined;
  items: SubscriptionFeatureDto[];
  setItems: React.Dispatch<React.SetStateAction<SubscriptionFeatureDto[]>>;
}
export default function PricingFeaturesTable({ plans, items, setItems }: Props) {
  const { t } = useTranslation();
  function onAddFeature() {
    const order = items.length === 0 ? 1 : Math.max(...items.map((o) => o.order)) + 1;
    setItems([
      ...items,
      {
        order,
        title: "",
        name: "",
        type: SubscriptionFeatureLimitType.NOT_INCLUDED,
        value: 0,
        accumulate: false,
      },
    ]);
  }

  function changeOrder(item: SubscriptionFeatureDto, index: number, direction: "up" | "down") {
    const newItems = [...items];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    newItems.splice(index, 1);
    newItems.splice(newIndex, 0, item);
    for (let i = 0; i < newItems.length; i++) {
      newItems[i].order = i + 1;
    }
    setItems(newItems);
  }

  function isLastItem(index: number) {
    return index === items.length - 1;
  }

  return (
    <div className="space-y-2">
      <Buttons plans={plans} items={items} setItems={setItems} onAddFeature={onAddFeature} />
      <div className="">
        <TableSimple
          headers={[
            {
              title: "",
              name: "feature-order",
              className: "w-10",
              // value: (item) => item.order,
              // type: InputType.NUMBER,
              // setValue: (order, idx) =>
              //   updateItemByIdx(items, setItems, idx, {
              //     order,
              //   }),
              // inputBorderless: true,
              value: (item, index) => (
                <div className="w-10">
                  <div className="flex items-center space-x-1 truncate">
                    <button
                      title="Move up"
                      type="button"
                      onClick={() => changeOrder(item, index, "up")}
                      className={clsx(
                        index <= 0 ? " cursor-not-allowed bg-gray-100 text-gray-300" : "hover:bg-gray-100 hover:text-gray-800",
                        "h-4 w-4 bg-gray-50 px-0.5 py-0.5 text-gray-500 focus:outline-none"
                      )}
                      disabled={index <= 0}
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
                      title="Move down"
                      type="button"
                      onClick={() => changeOrder(item, index, "down")}
                      className={clsx(
                        isLastItem(index) ? " cursor-not-allowed bg-gray-100 text-gray-300" : "hover:bg-gray-100 hover:text-gray-800",
                        "h-4 w-4 bg-gray-50 px-0.5 py-0.5 text-gray-500 focus:outline-none"
                      )}
                      disabled={isLastItem(index)}
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
                </div>
              ),
            },
            {
              title: t("shared.title"),
              name: "feature-title",
              className: "w-32",
              value: (item) => item.title,
              setValue: (title, idx) =>
                updateItemByIdx(items, setItems, idx, {
                  title,
                }),
              inputBorderless: true,
            },
            {
              title: t("shared.type"),
              name: "feature-type",
              type: InputType.SELECT,
              value: (item) => item.type,
              className: "w-32",
              options: [
                {
                  name: "Not included",
                  value: SubscriptionFeatureLimitType.NOT_INCLUDED,
                },
                {
                  name: "Included",
                  value: SubscriptionFeatureLimitType.INCLUDED,
                },
                {
                  name: "Monthly",
                  value: SubscriptionFeatureLimitType.MONTHLY,
                },
                {
                  name: "Max",
                  value: SubscriptionFeatureLimitType.MAX,
                },
                {
                  name: "Unlimited",
                  value: SubscriptionFeatureLimitType.UNLIMITED,
                },
              ],
              setValue: (type, idx) => {
                let value = items[idx].value;
                if (Number(type) !== SubscriptionFeatureLimitType.MAX && Number(type) !== SubscriptionFeatureLimitType.MONTHLY) {
                  value = 0;
                }
                updateItemByIdx(items, setItems, idx, {
                  type,
                  value,
                });
              },
              inputBorderless: true,
            },
            {
              title: t("shared.name"),
              name: "feature-name",
              className: "w-32",
              inputOptional: true,
              value: (item) => item.name,
              setValue: (name, idx) =>
                updateItemByIdx(items, setItems, idx, {
                  name,
                }),
              inputBorderless: true,
            },
            {
              title: "Value",
              name: "feature-value",
              type: InputType.NUMBER,
              className: "w-32",
              value: (item) => item.value,
              editable: (item) => item.type === SubscriptionFeatureLimitType.MAX || item.type === SubscriptionFeatureLimitType.MONTHLY,
              setValue: (value, idx) =>
                updateItemByIdx(items, setItems, idx, {
                  value,
                }),
              inputBorderless: true,
            },
            {
              title: "Link",
              name: "feature-href",
              type: InputType.TEXT,
              className: "w-32",
              inputOptional: true,
              value: (item) => item.href,
              setValue: (href, idx) =>
                updateItemByIdx(items, setItems, idx, {
                  href,
                }),
              inputBorderless: true,
            },
            {
              title: "Badge",
              name: "feature-badge",
              type: InputType.TEXT,
              className: "w-32",
              inputOptional: true,
              value: (item) => item.badge,
              setValue: (badge, idx) =>
                updateItemByIdx(items, setItems, idx, {
                  badge,
                }),
              inputBorderless: true,
            },
          ]}
          items={items}
          actions={[
            {
              title: t("shared.delete"),
              onClick: (idx) => setItems(items.filter((_x, i) => i !== idx)),
            },
          ]}
        ></TableSimple>
        {items.map((item, idx) => {
          return (
            <div key={idx} className=" ">
              <input readOnly hidden type="text" id="features[]" name="features[]" value={JSON.stringify(item)} />
            </div>
          );
        })}
      </div>
      {items.length > 10 && <Buttons plans={plans} items={items} setItems={setItems} onAddFeature={onAddFeature} />}
    </div>
  );
}

function Buttons({
  plans,
  items,
  setItems,
  onAddFeature,
}: {
  plans: SubscriptionProductDto[] | undefined;
  items: SubscriptionFeatureDto[];
  setItems: React.Dispatch<React.SetStateAction<SubscriptionFeatureDto[]>>;
  onAddFeature: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={onAddFeature}
        className="mt-2 flex items-center space-x-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 focus:text-gray-800 focus:ring focus:ring-gray-300 focus:ring-offset-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className="font-medium uppercase">{t("shared.add")}</span>
      </button>

      <Dropdown
        right={true}
        // onClick={() => alert("Dropdown click")}
        button={
          <Fragment>
            <DocumentDuplicateIcon className="h-4 w-4" />
            <span className="font-medium uppercase">Copy from product...</span>
          </Fragment>
        }
        btnClassName="mt-2 flex items-center space-x-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 focus:text-gray-800 focus:ring focus:ring-gray-300 focus:ring-offset-1"
        options={
          <div className="h-64 overflow-auto">
            {plans?.map((product, idx) => {
              return (
                <Menu.Item key={idx}>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => {
                        let uniqueFeatures = product.features.filter((feature) => !items.find((item) => item.name === feature.name));
                        setItems([...items, ...uniqueFeatures]);
                      }}
                      className={clsx("w-full text-left", active ? "bg-gray-100 text-gray-900" : "text-gray-700", "block px-4 py-2 text-sm")}
                    >
                      {t(product.title)} ({product.features.length})
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        }
      ></Dropdown>

      <button
        type="button"
        onClick={() => {
          setItems([]);
        }}
        disabled={items.length === 0}
        className={clsx(
          "border-border mt-2 flex items-center space-x-1 rounded-md border px-2 py-1 text-xs text-gray-600 focus:text-gray-800 focus:ring focus:ring-gray-300 focus:ring-offset-1",
          items.length === 0 ? "cursor-not-allowed opacity-80" : "bg-white hover:bg-gray-100"
        )}
      >
        <TrashEmptyIcon className="h-4 w-4" />
        <span className="font-medium uppercase">{t("shared.clear")}</span>
      </button>
    </div>
  );
}
