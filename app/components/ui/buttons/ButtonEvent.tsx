import { useLocation, useMatches } from "@remix-run/react";
import { ReactNode } from "react";
import { useRootData } from "~/utils/data/useRootData";
import AnalyticsHelper from "~/utils/helpers/AnalyticsHelper";
import LinkOrAhref from "./LinkOrAhref";
import clsx from "clsx";

const DEBUG_MODE = false;

interface Props {
  type?: "button" | "submit";
  to?: string | undefined;
  children: ReactNode;
  className?: string;
  target?: undefined | "_blank";
  role?: string;
  rel?: string;
  event: {
    action: string;
    category: string;
    label: string;
    value: string;
  };
  onClick?: () => void;
  sendEvent?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  reloadDocument?: boolean;
}
export default function ButtonEvent({
  type,
  to,
  target,
  children,
  className,
  role,
  rel,
  event,
  onClick,
  sendEvent = true,
  disabled,
  isLoading,
  reloadDocument,
}: Props) {
  let location = useLocation();
  const rootData = useRootData();
  const matches = useMatches();

  function onClicked() {
    if (onClick) {
      onClick();
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
    <LinkOrAhref
      type={type}
      to={to}
      target={target}
      className={clsx(className, DEBUG_MODE && "ring-2 ring-red-500 ring-offset-2")}
      role={role}
      rel={rel}
      onClick={onClicked}
      disabled={disabled}
      isLoading={isLoading}
      reloadDocument={reloadDocument}
    >
      {children}
    </LinkOrAhref>
  );
}
