import { Link, useLocation } from "@remix-run/react";
import clsx from "clsx";
import { SideBarItem } from "~/application/sidebar/SidebarItem";

export function DocsSidebarNav({ items }: { items: SideBarItem[] }) {
  return (
    <div>
      {items.length > 0 ? (
        <div className="w-full">
          {items.map((item, index) => (
            <div key={index} className={clsx(item.items && item.items.length > 0 && "pb-4")}>
              {item.path ? (
                <Link to={item.path} className="hover:underline">
                  <h4 className="mb-1 rounded-md px-2 py-1 font-semibold">{item.title}</h4>
                </Link>
              ) : (
                <h4 className="mb-1 rounded-md px-2 py-1 font-semibold">{item.title}</h4>
              )}
              {item.items && item.items.length > 0 && <DocsSidebarNavItems items={item.items} />}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DocsSidebarNavItems({ items }: { items: SideBarItem[] }) {
  const location = useLocation();
  const pathname = location.pathname;
  return items?.length ? (
    <div className="grid grid-flow-row auto-rows-max">
      {items.map((item, index) =>
        item.path ? (
          <Link
            key={index}
            to={item.path}
            className={clsx(
              "group flex w-full items-center rounded-md border border-transparent px-2 py-1 text-sm hover:underline",
              item.disabled && "cursor-not-allowed opacity-60",
              pathname === item.path ? "text-foreground font-medium" : "text-muted-foreground"
            )}
            target={item.target}
            rel={item.target ? "noreferrer" : ""}
            // preventScrollReset
          >
            {item.title}
            {item.side && (
              <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline">
                {item.side}
              </span>
            )}
          </Link>
        ) : (
          <span
            key={index}
            className={clsx(
              "text-muted-foreground flex w-full cursor-not-allowed items-center rounded-md p-2 hover:underline",
              item.disabled && "cursor-not-allowed opacity-60"
            )}
          >
            {item.title}
            {item.side && (
              <span className="bg-muted text-muted-foreground ml-2 rounded-md px-1.5 py-0.5 text-xs leading-none no-underline group-hover:no-underline">
                {item.side}
              </span>
            )}
          </span>
        )
      )}
    </div>
  ) : null;
}
