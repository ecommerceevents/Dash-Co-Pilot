import { Ref, forwardRef, useImperativeHandle, useRef, ReactNode, Fragment, useEffect, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { Link } from "@remix-run/react";
import { Colors } from "~/application/enums/shared/Colors";
import ColorBadge from "../badges/ColorBadge";
import HintTooltip from "../tooltips/HintTooltip";
import EntityIcon from "~/components/layouts/icons/EntityIcon";
import clsx from "clsx";
import { Input } from "../input";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

export interface RefInputCombobox {
  focus: () => void;
}

interface Props {
  name?: string;
  title?: string;
  value?: (string | number)[];
  disabled?: boolean;
  options: { value: string | number | undefined; name?: string | ReactNode; color?: Colors; disabled?: boolean }[];
  onChange?: (value: (string | number)[]) => void;
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
  darkMode?: boolean;
  autoFocus?: boolean;
  readOnly?: boolean;
  renderHiddenInputValue?: (item: string | number) => string;
  prefix?: string;
  onClear?: () => void;
  minDisplayCount?: number;
}
const InputCombobox = (
  {
    name,
    title,
    value,
    options,
    disabled,
    onChange,
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
    darkMode,
    autoFocus,
    readOnly,
    renderHiddenInputValue,
    prefix,
    onClear,
    minDisplayCount = 3,
  }: Props,
  ref: Ref<RefInputCombobox>
) => {
  const { t } = useTranslation();

  const button = useRef<HTMLButtonElement>(null);
  const inputSearch = useRef<HTMLInputElement>(null);

  const [selected, setSelected] = useState<(string | number)[]>(value || []);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (value && !isEqual(selected.sort(), value?.sort())) {
      setSelected(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (onChange && !isEqual(selected.sort(), value?.sort())) {
      onChange(selected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  function isEqual(a: any, b: any) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  useImperativeHandle(ref, () => ({ focus }));
  function focus() {
    setTimeout(() => {
      button.current?.focus();
      button.current?.click();
    }, 1);
  }

  const filteredItems = () => {
    if (!options) {
      return [];
    }
    return options.filter(
      (f) => f.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) || f.value?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };

  function getSelectedOptions() {
    return options.filter((f) => selected.includes(f.value as string | number));
  }

  return (
    // @ts-ignore
    <Combobox multiple value={selected} onChange={setSelected} disabled={disabled || readOnly}>
      {({ open }) => (
        <div>
          {/* {renderHiddenInputValue && <>
            {selected?.map((item, idx) => {
            return <input key={idx} type="hidden" name={name + `[]`} value={JSON.stringify(item)} />;
          })}
          </>} */}

          {withLabel && title && (
            <Combobox.Label htmlFor={name} className="mb-1 flex justify-between space-x-2 text-xs font-medium">
              <div className=" flex items-center space-x-1">
                <div className="truncate">
                  {title}
                  {required && <span className="ml-1 text-red-500">*</span>}
                </div>

                {help && <HintTooltip text={help} />}
              </div>
              {hint}
              {onClear && selected.length > 0 ? (
                <button type="button" onClick={onClear} className="text-xs text-gray-500 hover:text-gray-700 focus:outline-none">
                  {t("shared.clear")}
                </button>
              ) : null}
            </Combobox.Label>
          )}

          <div className="relative">
            <Combobox.Button
              autoFocus={autoFocus}
              type="button"
              ref={button}
              // className={clsx(
              //   "focus:border-accent-500 focus:ring-accent-500 relative w-full cursor-default rounded-md border border-gray-300 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 sm:text-sm",
              //   disabled || readOnly ? "cursor-not-allowed bg-gray-100" : "bg-white hover:bg-gray-50 focus:bg-gray-50",
              //   borderless && "border-transparent",
              //   darkMode && "dark:border-gray-800 dark:bg-gray-800"
              // )}
              className={clsx(
                className,
                "border-input ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border bg-transparent px-3 py-2 text-left text-sm shadow-sm focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
              )}
            >
              {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <EntityIcon className="h-5 w-5" icon={icon} />
                </div>
              )}

              <div className="inline-flex w-full items-center space-x-2 truncate">
                {/* {withColors && selected && <ColorBadge color={selected?.color ?? Colors.UNDEFINED} />} */}
                <div className="truncate">
                  {/* {JSON.stringify(selected)} */}
                  {selected.length > 0 ? (
                    <span className="truncate">
                      {prefix ?? ""}
                      {getSelectedOptions().length < minDisplayCount
                        ? getSelectedOptions()
                            .map((f) => f.name ?? f.value)
                            .join(", ")
                        : getSelectedOptions().length + " selected"}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">{selectPlaceholder ?? t("shared.select")}...</span>
                  )}
                </div>
              </div>
              <CaretSortIcon className="h-4 w-4 opacity-50" />
            </Combobox.Button>

            <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
              <Combobox.Options
                // onFocus={() => inputSearch.current?.focus()}
                onBlur={() => setSearchInput("")}
                className={clsx(
                  "bg-background text-foreground border-border absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-md border py-1 text-base shadow-lg focus:outline-none sm:text-sm"
                )}
              >
                {(withSearch || onNew || onNewRoute) && (
                  <div className="flex rounded-md p-2">
                    <div className="relative flex flex-grow items-stretch focus-within:z-10">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <Input
                        ref={inputSearch}
                        id="search"
                        autoComplete="off"
                        placeholder={t("shared.searchDot")}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {onNew && (
                      <button
                        title={t("shared.new")}
                        type="button"
                        onClick={onNew}
                        className="focus:border-accent-500 focus:ring-accent-500 relative -ml-px inline-flex items-center space-x-2 rounded-r-md px-2 py-2 text-sm font-medium focus:outline-none focus:ring-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    )}

                    {onNewRoute && (
                      <Link
                        to={onNewRoute}
                        className="focus:border-accent-500 focus:ring-accent-500 relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </Link>
                    )}
                  </div>
                )}

                {filteredItems().map((item, idx) => (
                  <Combobox.Option
                    key={idx}
                    disabled={item.disabled}
                    className={({ active, selected }) =>
                      clsx(
                        "text-foreground hover:bg-secondary hover:text-secondary-foreground relative cursor-default select-none py-2 pl-3 pr-9 focus:outline-none",
                        !item.disabled && active && " bg-background text-foreground ",
                        !item.disabled && !active && " ",
                        item.disabled && "cursor-not-allowed bg-gray-100 text-gray-400",
                        darkMode && !item.disabled && active && "dark:bg-accent-500 dark:text-black",
                        darkMode && !item.disabled && !active && "dark:text-gray-50",
                        darkMode && item.disabled && "cursor-not-allowed dark:bg-gray-900 dark:text-gray-600"
                        // selected && "bg-secondary text-secondary-foreground"
                      )
                    }
                    value={item.value}
                  >
                    {({ selected, active }) => (
                      <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          {withColors && item.color !== undefined && <ColorBadge color={item.color} />}
                          <div className={clsx(selected ? "font-normal" : "font-normal", "truncate")}>{item.name || item.value}</div>
                        </div>

                        {selected ? (
                          <div className={clsx(active ? "" : "", "absolute inset-y-0 right-0 flex items-center pr-4")}>
                            <CheckIcon className="h-4 w-4" />
                            {/* <svg xmlns="http://www.w3.org/2000/svg" className="text-foreground h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg> */}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </Combobox.Option>
                ))}

                {withSearch && filteredItems().length === 0 && <div className="px-3 py-2 text-sm text-gray-400">{t("shared.noRecords")}</div>}
              </Combobox.Options>
            </Transition>
          </div>
        </div>
      )}
    </Combobox>
  );
};

export default forwardRef(InputCombobox);
