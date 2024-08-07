import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import PropertyBadge from "./PropertyBadge";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import SelectorIcon from "../../ui/icons/SelectorIcon";
import CheckIcon from "../../ui/icons/CheckIcon";

interface Props {
  className?: string;
  selected: PropertyType;
  onSelected: (item: PropertyType) => void;
}

export default function PropertyTypeSelector({ className, selected, onSelected }: Props) {
  const items: PropertyType[] = [
    PropertyType.TEXT,
    PropertyType.NUMBER,
    PropertyType.DATE,
    // PropertyType.USER,
    // PropertyType.ROLE,
    PropertyType.SELECT,
    PropertyType.BOOLEAN,
    PropertyType.MEDIA,
    // PropertyType.ENTITY,
    // PropertyType.FORMULA,
    PropertyType.MULTI_SELECT,
    PropertyType.MULTI_TEXT,
    PropertyType.RANGE_NUMBER,
    PropertyType.RANGE_DATE,
    PropertyType.FORMULA,
  ];
  const { t } = useTranslation();
  return (
    <Listbox value={selected} onChange={onSelected}>
      {({ open }) => (
        <>
          <input type="hidden" name="type" value={selected} hidden readOnly />
          <div className={clsx("relative", className)}>
            <Listbox.Button className="focus:border-accent-500 focus:ring-accent-500 relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left text-gray-800 shadow-sm focus:outline-none focus:ring-1 sm:text-sm">
              <div className="flex items-center space-x-2">
                <PropertyBadge type={selected} className="h-4 w-4 text-gray-500" />
                <div className="truncate">{t("entities.fields." + PropertyType[selected])}</div>
              </div>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
              <Listbox.Options className="border-border bg-background absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border py-1 text-base shadow-lg focus:outline-none sm:text-sm">
                {items.length === 0 ? (
                  <div className=" flex select-none justify-center p-2 text-red-500">There are no fields</div>
                ) : (
                  <>
                    {items.map((item, idx) => (
                      <Listbox.Option
                        key={idx}
                        className={({ active }) =>
                          clsx(active ? " bg-secondary " : "", "hover:bg-secondary relative cursor-default select-none py-2 pl-3 pr-9")
                        }
                        value={item}
                      >
                        {({ selected, active }) => (
                          <>
                            <div className="flex items-center space-x-2">
                              <PropertyBadge type={item} className={clsx(active ? "" : "", "h-4 w-4")} />
                              <div className="truncate">{t("entities.fields." + PropertyType[item])}</div>
                            </div>
                            {selected ? (
                              <span className={clsx(active ? "" : "", "absolute inset-y-0 right-0 flex items-center pr-4")}>
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </>
                )}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
