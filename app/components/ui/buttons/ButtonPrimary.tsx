import { MouseEventHandler, ReactNode } from "react";
import LinkOrAhref from "./LinkOrAhref";
import { Button } from "../button";
import { useLocation, useMatches } from "@remix-run/react";
import { useRootData } from "~/utils/data/useRootData";
import AnalyticsHelper from "~/utils/helpers/AnalyticsHelper";
import clsx from "clsx";

interface Props {
  className?: string;
  type?: "button" | "submit" | "reset" | undefined;
  to?: string;
  target?: undefined | "_blank";
  rel?: string;
  disabled?: boolean;
  destructive?: boolean;
  isExternal?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  autoFocus?: boolean;
  children: ReactNode;
  prefetch?: "intent" | "render" | "none";
  event?: { action: string; category: string; label: string; value: string };
  sendEvent?: boolean;
}

export default function ButtonPrimary({
  className = "",
  type = "button",
  onClick,
  disabled,
  destructive,
  to,
  target,
  rel,
  isExternal = false,
  autoFocus,
  prefetch,
  children,
  event,
  sendEvent = true,
}: Props) {
  // const combinedClassName = clsx(
  //   className,
  //   "inline-flex items-center space-x-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-300",
  //   disabled && "cursor-not-allowed opacity-75",
  //   !destructive && "bg-primary",
  //   destructive && "bg-red-600",
  //   !disabled && !destructive && !className && "hover:bg-accent-900 focus:ring-accent-500 hover:text-accent-100",
  //   !disabled && destructive && "hover:bg-red-700 focus:ring-red-500"
  // );

  let location = useLocation();
  const rootData = useRootData();
  const matches = useMatches();

  function onClicked(e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    if (onClick) {
      onClick(e);
    }
    if (!event || !sendEvent) {
      return;
    }
    const routeMatch = matches.find((m) => m.pathname == location.pathname);
    AnalyticsHelper.addEvent({
      url: location.pathname,
      route: routeMatch?.id,
      rootData,
      action: event.action,
      category: event.category,
      label: event.label,
      value: event.value,
    });
  }

  return (
    <span>
      {(() => {
        if (!to || disabled) {
          return (
            <Button
              variant={destructive ? "destructive" : undefined}
              className={clsx("inline-flex items-center space-x-2", className)}
              onClick={onClicked}
              type={type}
              disabled={disabled}
              autoFocus={autoFocus}
            >
              {children}
            </Button>
          );
        } else if (to && isExternal) {
          return (
            <Button asChild>
              <a
                href={to}
                target={target}
                rel={rel}
                autoFocus={autoFocus}
                onClick={onClicked}
                className={clsx("inline-flex items-center space-x-2", className)}
              >
                {children}
              </a>
            </Button>
          );
        } else {
          return (
            <Button asChild>
              <LinkOrAhref
                to={disabled ? "" : to}
                target={target}
                rel={rel}
                prefetch={prefetch}
                className={clsx("inline-flex items-center space-x-2", className)}
                // className={clsx(
                //   className,
                //   "borde1-transparent focus:ring-accent-300 inline-flex items-center space-x-2 rounded-md border px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2",
                //   disabled && "cursor-not-allowed opacity-75",
                //   !destructive && "bg-primary",
                //   destructive && "bg-red-600",
                //   !disabled && !destructive && !className && "hover:bg-accent-900 hover:text-accent-100 focus:ring-accent-500",
                //   !disabled && destructive && "hover:bg-red-700 focus:ring-red-500"
                // )}
                autoFocus={autoFocus}
                onClick={onClicked}
              >
                {children}
              </LinkOrAhref>
            </Button>
          );
        }
      })()}
    </span>
  );
}
