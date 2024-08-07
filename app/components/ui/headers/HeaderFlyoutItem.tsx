import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import clsx from "clsx";
import ChevronDownIcon from "../../ui/icons/ChevronDownIcon";
import { useTranslation } from "react-i18next";
import { NavbarItemDto } from "~/modules/pageBlocks/components/blocks/marketing/header/HeaderBlockUtils";
import ButtonEvent from "../buttons/ButtonEvent";

interface Props {
  title: string;
  items?: NavbarItemDto[];
  className?: string;
}
export default function HeaderFlyoutItem({ title, items, className }: Props) {
  const { t } = useTranslation();
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={clsx(
              className,
              open ? "" : " text-muted-foreground",
              "group inline-flex w-full items-center space-x-2 truncate rounded-md text-base font-medium focus:outline-none "
            )}
          >
            <span>{title}</span>
            <ChevronDownIcon className={clsx(open ? "" : " text-muted-foreground", "group-hover:text-muted-foreground h-5 w-5")} aria-hidden="true" />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute left-1/2 z-20 mt-3 w-screen max-w-xs -translate-x-1/2 transform px-2 sm:px-0">
              {({ close }) => (
                <div className="border-border bg-background overflow-hidden rounded-lg border shadow-lg ring-opacity-5">
                  <div className="relative grid gap-6 px-5 py-6 sm:gap-8 sm:p-8">
                    {items?.map((item) => (
                      <Fragment key={item.title}>
                        <ButtonEvent
                          event={{
                            category: "click",
                            action: "header-flyout",
                            label: item.title,
                            value: item.path ?? "",
                          }}
                          onClick={() => close()}
                          to={item.path ?? "#"}
                          target={item.target}
                          className="-m-3 block rounded-md p-3 transition duration-150 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                          <p className="text-base font-medium ">
                            {t(item.title)} {item.hint && <span className="text-xs">({t(item.hint)})</span>}
                          </p>
                          {item.description && <p className="text-muted-foreground mt-1 text-sm">{t(item.description)}</p>}
                        </ButtonEvent>
                      </Fragment>
                    ))}
                  </div>
                </div>
              )}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
