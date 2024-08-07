import { Property } from "@prisma/client";
import clsx from "clsx";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSubmit } from "@remix-run/react";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import EntityHelper from "~/utils/helpers/EntityHelper";
import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import LockClosedIcon from "../../ui/icons/LockClosedIcon";
import NewFieldIcon from "../../ui/icons/NewFieldIcon";
import PencilIcon from "../../ui/icons/PencilIcon";
import TrashIcon from "../../ui/icons/TrashIcon";
import ConfirmModal, { RefConfirmModal } from "../../ui/modals/ConfirmModal";
import PropertyBadge from "./PropertyBadge";
import OrderListButtons from "../../ui/sort/OrderListButtons";
import EyeIcon from "~/components/ui/icons/EyeIcon";
import EyeLashIcon from "~/components/ui/icons/EyeLashIcon";
import DocumentDuplicateIconFilled from "~/components/ui/icons/DocumentDuplicateIconFilled";

interface Props {
  tenantId: string | null;
  items: PropertyWithDetails[];
  className?: string;
}

export default function TenantPropertiesList({ tenantId, items, className }: Props) {
  const { t } = useTranslation();
  const submit = useSubmit();

  const confirmDelete = useRef<RefConfirmModal>(null);

  const [showDefaultFields, setShowDefaultFields] = useState(false);

  function deleteField(item: Property) {
    confirmDelete.current?.setValue(item);
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  function confirmedDelete(item: Property) {
    const form = new FormData();
    form.set("action", "delete");
    form.set("id", item.id);
    submit(form, {
      method: "post",
    });
  }
  function onToggleDisplay(item: Property) {
    const form = new FormData();
    form.set("action", "toggle-display");
    form.set("id", item.id);
    submit(form, {
      method: "post",
    });
  }
  function onDuplicate(item: Property) {
    const form = new FormData();
    form.set("action", "duplicate");
    form.set("id", item.id);
    submit(form, {
      method: "post",
    });
  }

  return (
    <div className={clsx(className, "")}>
      <div className="space-y-2">
        {showDefaultFields && (
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{t("models.property.defaultProperties.title")}</h3>
              {showDefaultFields && (
                <div className="flex justify-end">
                  <ButtonTertiary className="-my-1" onClick={() => setShowDefaultFields(!showDefaultFields)}>
                    {t("models.property.defaultProperties.hide")}
                  </ButtonTertiary>
                </div>
              )}
            </div>
            {items
              .filter((f) => f.tenantId === null)
              .map((item, idx) => {
                return (
                  <div key={idx} className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 shadow-sm">
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2">
                        <div className=" flex items-center space-x-3">
                          <div className="  flex items-center space-x-2">
                            <LockClosedIcon className="h-4 w-4 text-gray-300" />
                            {/* <PropertyBadge className="h-4 w-4 text-gray-400" /> */}
                            {/* <div className="truncate text-sm text-gray-400">{t("entities.fields." + PropertyType[item.type])}</div> */}
                          </div>

                          <div className="text-sm text-gray-400">
                            {/* <PropertyTitle item={item} /> */}
                            <div className="flex flex-col">
                              <div>{t(item.title)}</div>
                              <div className="text-xs text-gray-500">{item.name}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
      <div className="">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">{t("models.property.plural")}</h3>
            {!showDefaultFields && (
              <div className="flex justify-end">
                <ButtonTertiary className="-my-1" onClick={() => setShowDefaultFields(!showDefaultFields)}>
                  {t("models.property.defaultProperties.show")}
                </ButtonTertiary>
              </div>
            )}
          </div>

          {items
            .filter((f) => !f.isDefault && f.tenantId === tenantId)
            .sort((a, b) => a.order - b.order)
            .map((item, idx) => {
              return (
                <div key={idx} className="rounded-md border border-gray-300 bg-white px-4 py-1 shadow-sm">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2 truncate">
                      <div className=" flex items-center space-x-3 truncate">
                        <div className="hidden flex-shrink-0 sm:flex">
                          <OrderListButtons index={idx} items={items.filter((f) => !f.isDefault)} editable={true} />
                        </div>
                        <div className="  flex items-center space-x-2">
                          <PropertyBadge type={item.type} className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex items-center space-x-2 truncate text-sm text-gray-800">
                          <PropertyTitle item={item} />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 space-x-1">
                      <div className="flex items-center space-x-1 truncate p-1">
                        <button
                          type="button"
                          onClick={() => onToggleDisplay(item)}
                          className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          {item.isDisplay ? (
                            <EyeIcon className="h-4 w-4 text-gray-500 hover:text-gray-600" />
                          ) : (
                            <EyeLashIcon className="h-4 w-4 text-gray-300 hover:text-gray-500" />
                          )}
                        </button>
                        <Link
                          to={item.id}
                          className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                          // onClick={() => update(idx, item)}
                        >
                          <PencilIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDuplicate(item)}
                          className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <DocumentDuplicateIconFilled className="h-4 w-4 text-gray-300 hover:text-gray-500" />
                        </button>
                        <button
                          type="button"
                          className="group flex items-center rounded-md border border-transparent p-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                          onClick={() => deleteField(item)}
                        >
                          <TrashIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      <div className="mt-3">
        <Link
          to={`new`}
          className="focus:ring-theme-500 relative block w-full rounded-lg border-2 border-dashed border-gray-300 px-12 py-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <NewFieldIcon className="mx-auto h-8 text-gray-600" />
          <span className="mt-2 block text-sm font-medium text-gray-900">{t("models.property.actions.add")}</span>
        </Link>
      </div>
      {/* <PropertyForm ref={propertyForm} entityId={entityId} onCreated={created} onUpdated={updated} onDeleted={deleted} /> */}
      <ConfirmModal ref={confirmDelete} destructive onYes={confirmedDelete} />
    </div>
  );
}

const PropertyTitle = ({ item }: { item: PropertyWithDetails }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex items-baseline space-x-1 truncate">
        <div className="flex flex-col">
          <div>
            {t(EntityHelper.getFieldTitle(item, item.isDefault))}
            {item.isRequired && <span className="text-red-500">*</span>}
          </div>
          <div className="text-xs text-gray-500">
            {item.name}
            {item.subtype === "phone" && " (phone)"}
            {item.subtype === "url" && " (URL)"}
            {[PropertyType.MULTI_SELECT, PropertyType.SELECT].includes(item.type) && "[]"}
            {[PropertyType.RANGE_NUMBER, PropertyType.RANGE_DATE].includes(item.type) && " (range)"}
            {[PropertyType.FORMULA].includes(item.type) && ` (formula)`}
          </div>
        </div>
        {/* {item.type === PropertyType.FORMULA && <div className="truncate italic text-gray-400">({item.formula})</div>} */}
        {[PropertyType.SELECT, PropertyType.MULTI_SELECT].includes(item.type) && (
          <div className="truncate text-xs text-gray-400">
            [{item.options.length === 0 ? "No options" : "Options: " + item.options?.map((f) => f.value).join(", ")}]
          </div>
        )}

        {item.attributes.filter((f) => f.value).length > 0 && (
          <div className="truncate text-xs text-gray-400">
            [
            {item.attributes
              .filter((f) => f.value)
              .map((f) => `${f.name}: ${f.value}`)
              .join(", ")}
            ]
          </div>
        )}
      </div>
    </>
  );
};
