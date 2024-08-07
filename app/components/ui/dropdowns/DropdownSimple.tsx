import { Fragment, ReactNode } from "react";
import { Menu, Transition } from "@headlessui/react";
import clsx from "clsx";
import OptionsIcon from "../icons/OptionsIcon";
import { Link } from "@remix-run/react";

interface Props {
  items?: (
    | {
        label: string;
        onClick: () => void;
      }
    | {
        label: string;
        href: string;
        target?: "_blank" | string;
      }
  )[];
  button?: ReactNode;
  disabled?: boolean;
  className?: string;
  width?: "w-48" | "w-56" | "w-64" | "w-72" | "w-80" | "w-96";
  right?: boolean;
}

export default function DropdownSimple({ items, button, disabled, className, right, width = "w-48" }: Props) {
  return (
    <Menu as="div" className={clsx(className, "relative inline-block text-left")}>
      <div>
        <Menu.Button disabled={disabled}>{button ?? <OptionsIcon />}</Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={clsx(
            "absolute z-40 mt-2 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
            right ? "left-0 origin-top-left" : "right-0 origin-top-right",
            width
          )}
        >
          <div className="py-1">
            {items?.map((item, i) => {
              return (
                <Menu.Item key={i}>
                  {({ active, close }) => {
                    return (
                      <Fragment>
                        {"href" in item ? (
                          <Link
                            to={item.href}
                            target={item.target}
                            className={clsx("w-full text-left", active ? "bg-gray-100 text-gray-900" : "text-gray-700", "block px-4 py-2 text-sm")}
                            onClick={() => close()}
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              item.onClick();
                              close();
                            }}
                            className={clsx("w-full text-left", active ? "bg-gray-100 text-gray-900" : "text-gray-700", "block px-4 py-2 text-sm")}
                          >
                            {item.label}
                          </button>
                        )}
                      </Fragment>
                    );
                  }}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
