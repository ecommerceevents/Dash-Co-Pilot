import { Fragment, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "../sheet";
import { Button } from "../button";
import Logo from "~/components/brand/Logo";
import { ScrollArea } from "../scroll-area";
import { Link } from "@remix-run/react";
import clsx from "clsx";
import { SideBarItem } from "~/application/sidebar/SidebarItem";

export function MobileNav({ items }: { items: SideBarItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <svg strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground h-6 w-6">
            <path d="M3 5H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M3 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M3 19H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Logo className="mr-2" />
        <ScrollArea className="my-4 h-[calc(100vh-100px)] pb-10 pl-3">
          <div className="flex flex-col space-y-3">
            {/* {docsConfig.mainNav?.map(
              (item) =>
                item.href && (
                  <MobileLink key={item.href} href={item.href} onOpenChange={setOpen}>
                    {item.title}
                  </MobileLink>
                )
            )} */}
            {/* MAIN NAV? */}
          </div>
          <div className="flex flex-col space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col space-y-3 pt-4">
                {item.path ? (
                  <Link to={item.path}>
                    <h4 className="font-medium">{item.title}</h4>
                  </Link>
                ) : (
                  <h4 className="font-medium">{item.title}</h4>
                )}
                {item.items?.map((item) => (
                  <Fragment key={item.path}>
                    {!item.disabled &&
                      (item.path ? (
                        <MobileLink href={item.path} onOpenChange={setOpen} className="text-muted-foreground">
                          {item.title}
                          {item.side && (
                            <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline">
                              {item.side}
                            </span>
                          )}
                        </MobileLink>
                      ) : (
                        item.title
                      ))}
                  </Fragment>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: {
  href: string;
  onOpenChange: (open: boolean) => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={href}
      onClick={() => {
        onOpenChange?.(false);
      }}
      className={clsx(className)}
      {...props}
    >
      {children}
    </Link>
  );
}
