import LogoLight from "~/assets/img/logo-light.png";
import clsx from "clsx";
import { Link } from "@remix-run/react";
import { useRootData } from "~/utils/data/useRootData";
import { Fragment } from "react";

interface Props {
  className?: string;
  size?: string;
  to?: string;
}

export default function LogoLightMode({ className = "", size = "h-9", to }: Props) {
  const { appConfiguration } = useRootData();
  return (
    <Link to={to ?? "/"} className={clsx(className, "flex")}>
      {/* <BrandLogo className="h-10 w-auto mx-auto" /> */}
      {appConfiguration?.branding.logo ? (
        <Fragment>
          <img className={clsx(size, "mx-auto w-auto")} src={appConfiguration.branding.logo} alt="Logo" />
        </Fragment>
      ) : (
        <Fragment>
          <img className={clsx(size, "mx-auto w-auto")} src={LogoLight} alt="Logo" />
        </Fragment>
      )}
    </Link>
  );
}
