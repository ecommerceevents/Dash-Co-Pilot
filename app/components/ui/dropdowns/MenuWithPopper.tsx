import React, { MouseEventHandler, ReactNode } from "react";
import { Menu, Transition } from "@headlessui/react";
import clsx from "clsx";
import { usePopper } from "./use-popper";
import { Link } from "@remix-run/react";

interface Props {
  button: ReactNode;
  options: {
    title?: string;
    routePath?: string;
    onClick?: () => void | undefined;
    disabled?: boolean;
    className?: string;
    render?: (active: boolean, close: () => void) => ReactNode;
  }[];
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}
export default function MenuWithPopper({ button, options, size = "sm", onClick, className }: Props) {
  let [trigger, container] = usePopper({
    strategy: "fixed",
  });

  return (
    <Menu>
      <span>
        <Menu.Button ref={trigger} onClick={onClick} className={className}>
          {button}
        </Menu.Button>
      </span>

      <div ref={container} className={clsx(size === "sm" && "w-56", size === "md" && "w-64", size === "lg" && "w-80", size === "xl" && "w-96")}>
        <Transition
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Menu.Items className="divide-y divide-gray-100 rounded-md border border-gray-200 bg-white shadow-lg outline-none">
            <div className="py-1">
              {options.map((item, idx) => {
                return (
                  <Menu.Item key={idx}>
                    {({ active, close }) => (
                      <>
                        {item.render && item.render(active, close)}
                        {item.onClick && (
                          <button
                            type="button"
                            className={clsx(
                              item.className,
                              "w-full text-left hover:bg-gray-100",
                              item.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                              active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                              "block px-4 py-2 text-sm"
                            )}
                            disabled={item.disabled}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.onClick) {
                                item.onClick();
                              }
                              close();
                            }}
                          >
                            {item.title}
                          </button>
                        )}
                        {item.routePath && (
                          <Link
                            to={item.routePath}
                            onClick={(e) => {
                              e.stopPropagation();
                              close();
                            }}
                            className={clsx(
                              item.className,
                              "w-full text-left hover:bg-gray-100",
                              item.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                              active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                              "block px-4 py-2 text-sm"
                            )}
                          >
                            {item.title}
                          </Link>
                        )}
                      </>
                    )}
                  </Menu.Item>
                );
              })}
            </div>
          </Menu.Items>
        </Transition>
      </div>
    </Menu>
  );
}
