import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import JsonPropertyForm from "./JsonPropertyForm";
import TrashIcon from "~/components/ui/icons/TrashIcon";
import { JsonPropertyDto } from "~/modules/jsonProperties/dtos/JsonPropertyTypeDto";
import OrderListButtons from "~/components/ui/sort/OrderListButtons";
import JsonPropertyTypeIcon from "./JsonPropertyTypeIcon";
import PencilIcon from "~/components/ui/icons/PencilIcon";
import NewFieldIcon from "~/components/ui/icons/NewFieldIcon";
import { useSubmit } from "@remix-run/react";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";

interface Props {
  items: JsonPropertyDto[];
}
export default function JsonPropertiesTable({ items }: Props) {
  const { t } = useTranslation();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);

  const [selectedProperty, setSelectedProperty] = useState<JsonPropertyDto | null | undefined>(undefined);

  function onDelete(item: JsonPropertyDto) {
    confirmDelete.current?.setValue(item);
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  function onDeleteConfirmed(item: JsonPropertyDto) {
    const form = new FormData();
    form.set("action", "properties-delete");
    form.set("name", item.name);
    submit(form, {
      method: "post",
    });
  }

  return (
    <div className="space-y-1">
      {/* <div className="flex justify-between space-x-2">
        <label className="text-xs font-medium">{t("models.jsonProperty.plural")}</label>
        <button
          type="button"
          className="bg-secondary hover:bg-secondary hover:text-secondary-foreground hover:border-border text-muted-foreground rounded-md border border-transparent p-1 px-2 text-sm font-medium"
          onClick={() => setSelectedProperty(null)}
        >
          {t("shared.add")}
        </button>
      </div> */}
      {items.map((item, idx) => {
        return <input key={idx} type="hidden" name="properties[]" value={JSON.stringify(item)} readOnly hidden />;
      })}

      <div className="space-y-1">
        {items.map((item, idx) => {
          return (
            <div key={item.name} className="rounded-md border border-gray-300 bg-white px-4 py-1 shadow-sm">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2 truncate">
                  <div className=" flex items-center space-x-3 truncate">
                    <div className="hidden flex-shrink-0 sm:flex">
                      <OrderListButtons
                        index={idx}
                        items={items.map((f, idx) => ({ ...f, id: f.name, order: idx }))}
                        editable={true}
                        actionName="properties-sort"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <JsonPropertyTypeIcon type={item.type} className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-center space-x-2 truncate text-sm text-gray-800">
                      <div className="flex items-baseline space-x-1 truncate">
                        <div className="flex flex-col">
                          <div>
                            {item.title}
                            {item.required && <span className="text-red-500">*</span>}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.name}
                            {["select", "multiselect"].includes(item.type) && "[]"}
                            {["range-date", "range-number"].includes(item.type) && " (range)"}
                          </div>
                        </div>
                        {/* {item.type === PropertyType.FORMULA && <div className="truncate italic text-gray-400">({item.formula})</div>} */}
                        {["select", "multiselect"].includes(item.type) && (
                          <div className="truncate text-xs text-gray-400">
                            {t("shared.options")}: [{!item.options || item.options.length === 0 ? "" : item.options?.map((f) => f.value).join(", ")}]
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-shrink-0 space-x-1">
                  <div className="flex items-center space-x-1 truncate p-1">
                    <button
                      type="button"
                      onClick={() => setSelectedProperty(item)}
                      className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                      // onClick={() => update(idx, item)}
                    >
                      <PencilIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                    </button>
                    <button
                      type="button"
                      className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                      onClick={() => onDelete(item)}
                    >
                      <TrashIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div>
          <button
            type="button"
            onClick={() => setSelectedProperty(null)}
            className="focus:ring-ring relative block w-full rounded-lg border-2 border-dashed border-gray-300 px-12 py-3 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <NewFieldIcon className="text-muted-foreground mx-auto h-4" />
            <span className="mt-1 block text-xs font-medium">{t("models.jsonProperty.actions.add")}</span>
          </button>
        </div>
      </div>

      {/* <TableSimple
        items={items}
        emptyState={{ title: t("shared.noCustomProperties"), description: "" }}
        actions={[
          {
            title: t("shared.edit"),
            onClick: (_, item) => setSelectedProperty(item),
          },
          {
            title: <TrashIcon className="text-muted-foreground group-hover:text-foreground h-4 w-4" />,
            onClick: (_, item) => onChange(items.filter((i) => i !== item)),
          },
        ]}
        headers={[
          {
            name: "type",
            title: "Type",
            value: (item) => <JsonPropertyTypeIcon type={item.type} className="h-4 w-4 text-gray-400" />,
          },
          {
            name: "name",
            title: "Name",
            className: "w-full",
            value: (item) => (
              <div className="flex flex-col">
                <div className="font-medium">
                  {item.title} <span className="text-muted-foreground text-xs">({item.name})</span>
                </div>
              </div>
            ),
          },
          {
            name: "required",
            title: t("shared.required"),
            value: (item) => (item.required ? <CheckIcon className="text-muted-foreground h-4 w-4" /> : <XIcon className="text-muted-foreground h-4 w-4" />),
          },
        ]}
      /> */}

      <SlideOverWideEmpty
        title={selectedProperty === null ? t("shared.new") : t("shared.edit")}
        open={selectedProperty !== undefined}
        onClose={() => setSelectedProperty(undefined)}
        size="md"
      >
        {selectedProperty !== undefined && <JsonPropertyForm item={selectedProperty} onClose={() => setSelectedProperty(undefined)} />}
      </SlideOverWideEmpty>

      <ConfirmModal ref={confirmDelete} destructive onYes={onDeleteConfirmed} />
    </div>
  );
}
