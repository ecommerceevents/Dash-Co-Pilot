import { KeyboardEvent, Ref, forwardRef, useImperativeHandle, useRef, ReactNode, Fragment, useEffect, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { Link } from "@remix-run/react";
import { Colors } from "~/application/enums/shared/Colors";
import EntityIcon from "~/components/layouts/icons/EntityIcon";
import clsx from "clsx";
import HintTooltip from "../../tooltips/HintTooltip";
import ColorBadge from "../../badges/ColorBadge";

export interface RefInputSelectorDarkMode {
  focus: () => void;
}

type GroupDto = { name: string; items: ItemDto[] };
type ItemDto = {
  group?: string;
  name: string | ReactNode;
  value: string | number | undefined;
  color?: Colors;
  disabled?: boolean;
  link?: string;
  img?: ReactNode;
};
interface Props {
  name?: string;
  title?: string;
  value?: string | number | undefined;
  disabled?: boolean;
  options: ItemDto[];
  setValue?: React.Dispatch<React.SetStateAction<string | number | undefined>>;
  className?: string;
  withSearch?: boolean;
  withLabel?: boolean;
  withColors?: boolean;
  selectPlaceholder?: string;
  onNew?: () => void;
  onNewRoute?: string;
  required?: boolean;
  help?: string;
  hint?: ReactNode;
  icon?: string;
  borderless?: boolean;
  autoFocus?: boolean;
  readOnly?: boolean;
  renderSelected?: (item: ItemDto) => ReactNode;
}
const InputSelectorDarkMode = (
  {
    name,
    title,
    value,
    options,
    disabled,
    setValue,
    className,
    withSearch = true,
    withLabel = true,
    withColors = false,
    selectPlaceholder,
    onNew,
    required,
    onNewRoute,
    help,
    hint,
    icon,
    borderless,
    autoFocus,
    readOnly,
    renderSelected,
  }: Props,
  ref: Ref<RefInputSelectorDarkMode>
) => {
  const { t } = useTranslation();

  const button = useRef<HTMLButtonElement>(null);
  const inputSearch = useRef<HTMLInputElement>(null);

  const [selected, setSelected] = useState<{ name: string | ReactNode; value: string | number | undefined; color?: Colors }>();
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const selected = options.find((f) => f.value === value);
    setSelected(selected);
  }, [options, value]);

  useEffect(() => {
    if (selected && setValue && value !== selected?.value) {
      setValue(selected?.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useImperativeHandle(ref, () => ({ focus }));
  function focus() {
    setTimeout(() => {
      button.current?.focus();
      button.current?.click();
    }, 1);
  }

  function trySelect(event: KeyboardEvent) {
    if (event.code === "Enter") {
      if (filteredItems().length > 0) {
        setSelected(filteredItems()[0]);
      }
    }
  }

  const filteredItems = () => {
    if (!options) {
      return [];
    }
    return options.filter(
      (f) => f.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) || f.value?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };

  function itemsByGroup(): GroupDto[] {
    const groups: GroupDto[] = [];
    filteredItems().forEach((item) => {
      const group = groups.find((f) => f.name === item.group);
      if (group) {
        group.items.push(item);
      } else {
        groups.push({ name: item.group ?? "", items: [item] });
      }
    });
    return groups;
  }

  return (
    <Listbox value={selected} onChange={setSelected} disabled={disabled || readOnly}>
      {({ open }) => (
        <div className={clsx(className, "text-slate-50")}>
          {withLabel && title && (
            <Listbox.Label htmlFor={name} className="mb-1 flex justify-between space-x-2 text-xs font-medium text-slate-600">
              <div className=" flex items-center space-x-1">
                <div className="truncate">
                  {title}
                  {required && <span className="ml-1 text-red-500">*</span>}
                </div>

                {help && <HintTooltip text={help} />}
              </div>
              {hint}
            </Listbox.Label>
          )}

          <div className="relative">
            <Listbox.Button
              autoFocus={autoFocus}
              type="button"
              ref={button}
              className={clsx(
                "focus:border-accent-500 focus:ring-accent-700 relative w-full cursor-default rounded-sm border border-slate-800 bg-slate-800 py-2 pl-3 pr-10 text-left text-slate-50 shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-1 sm:text-sm",
                disabled || readOnly ? "cursor-not-allowed bg-slate-700" : "bg-slate-800 hover:bg-slate-700 focus:bg-slate-900",
                borderless && "border-transparent"
              )}
            >
              <input type="hidden" name={name} value={selected?.value ?? ""} hidden readOnly />

              {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <EntityIcon className="h-5 w-5 text-slate-400" icon={icon} />
                </div>
              )}

              <span className="inline-flex w-full items-center space-x-2 truncate">
                {withColors && selected && <ColorBadge color={selected?.color ?? Colors.UNDEFINED} />}
                <div className="truncate">
                  {selected ? (
                    <span>{renderSelected ? renderSelected(selected) : selected.name}</span>
                  ) : (
                    <span className="text-sm text-slate-500">{selectPlaceholder ?? t("shared.select")}...</span>
                  )}
                </div>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </Listbox.Button>

            <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
              <Listbox.Options
                // onFocus={() => inputSearch.current?.focus()}
                onBlur={() => setSearchInput("")}
                className={clsx(
                  "absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-sm bg-slate-800 py-1 text-base text-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                )}
              >
                {(withSearch || onNew || onNewRoute) && (
                  <div className="flex rounded-sm p-2">
                    <div className="relative flex flex-grow items-stretch focus-within:z-10">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        ref={inputSearch}
                        id="search"
                        autoComplete="off"
                        onKeyDown={trySelect}
                        placeholder={t("shared.searchDot")}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="focus:border-accent-300 block w-full rounded-none rounded-l-md border border-slate-300 bg-white px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-slate-300 sm:text-sm"
                      />
                    </div>
                    {onNew && (
                      <button
                        title={t("shared.new")}
                        type="button"
                        onClick={onNew}
                        className="focus:border-accent-500 focus:ring-accent-500 relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-slate-300 bg-slate-50 px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    )}

                    {onNewRoute && (
                      <Link
                        to={onNewRoute}
                        className="focus:border-accent-500 focus:ring-accent-500 relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-slate-300 bg-slate-50 px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </Link>
                    )}
                  </div>
                )}

                {itemsByGroup().map((group, idx) => (
                  <Fragment key={idx}>
                    {group.name && (
                      <Listbox.Option
                        disabled
                        className={({ active }) =>
                          clsx("relative cursor-default select-none py-1 pl-3 pr-9", active ? "bg-accent-500 text-black" : "text-slate-50")
                        }
                        value={group}
                      >
                        {({ selected, active }) => (
                          <Fragment>
                            <span className={clsx("text-xs font-medium text-gray-500", selected ? "font-semibold" : "font-normal")}>{group.name}</span>
                          </Fragment>
                        )}
                      </Listbox.Option>
                    )}

                    {group.items.map((item, idx) => (
                      <Listbox.Option
                        key={idx}
                        disabled={item.disabled}
                        className={({ active }) =>
                          clsx(
                            "relative cursor-default select-none py-2 pl-3 pr-9 text-gray-200 hover:text-white",
                            !item.disabled && active && "bg-accent-500",
                            !item.disabled && !active && "",
                            item.disabled && "cursor-not-allowed"
                          )
                        }
                        value={item}
                      >
                        {({ selected, active }) => (
                          <Fragment>
                            {item.link ? (
                              <Link to={item.link}>
                                <Item item={item} selected={selected} active={active} withColors={withColors} />
                              </Link>
                            ) : (
                              <Item item={item} selected={selected} active={active} withColors={withColors} />
                            )}
                          </Fragment>
                        )}
                      </Listbox.Option>
                    ))}
                  </Fragment>
                ))}

                {withSearch && filteredItems().length === 0 && <div className="px-3 py-2 text-sm text-slate-400">{t("shared.noRecords")}</div>}
              </Listbox.Options>
            </Transition>
          </div>
        </div>
      )}
    </Listbox>
  );
};

function Item({ item, selected, active, withColors = true }: { item: ItemDto; selected: boolean; active: boolean; withColors?: boolean }) {
  return (
    <Fragment>
      <div className="flex items-center space-x-2 truncate pr-3">
        {item.img && item.img}
        <div className="flex items-center space-x-2 truncate">
          {withColors && item.color !== undefined && <ColorBadge color={item.color} />}
          <div className={clsx(selected ? "font-medium" : "font-normal", "truncate")}>{item.name}</div>
        </div>
      </div>

      {selected ? (
        <span className={clsx(active ? "text-white" : "text-accent-400", "absolute inset-y-0 right-0 flex items-center pr-4")}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      ) : null}
    </Fragment>
  );
}

export default forwardRef(InputSelectorDarkMode);
