import clsx from "clsx";
import { Link } from "@remix-run/react";
import IconLight from "~/assets/img/icon-light.png";
import IconDark from "~/assets/img/icon-dark.png";
import { useRootData } from "~/utils/data/useRootData";
import { Fragment } from "react";

interface Props {
  className?: string;
  size?: string;
  fromConfig?: boolean;
}

export default function Icon({ className = "", size = "h-9", fromConfig = true }: Props) {
  const { appConfiguration } = useRootData();
  return (
    <Link to="/" className={clsx(className, "flex")}>
      {fromConfig && appConfiguration?.branding.icon ? (
        <Fragment>
          <img className={clsx(size, "hidden w-auto dark:block")} src={appConfiguration.branding.iconDarkMode ?? appConfiguration.branding.icon} alt="Icon" />
          <img className={clsx(size, "w-auto dark:hidden")} src={appConfiguration.branding.icon} alt="Icon" />
        </Fragment>
      ) : (
        <Fragment>
          <img className={clsx(size, "hidden w-auto dark:block")} src={IconDark} alt="Logo" />
          <img className={clsx(size, "w-auto dark:hidden")} src={IconLight} alt="Logo" />
        </Fragment>
      )}
    </Link>
  );
}
