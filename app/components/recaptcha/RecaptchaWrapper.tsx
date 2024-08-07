import { Fragment } from "react";
import { useRootData } from "~/utils/data/useRootData";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-ultimate";

interface Props {
  children: React.ReactNode;
  enabled: boolean;
}
export default function RecaptchaWrapper({ children, enabled }: Props) {
  const rootData = useRootData();
  const siteKey = rootData.appConfiguration.auth.recaptcha.siteKey;
  return (
    <Fragment>
      {enabled ? (
        <Fragment>
          {!siteKey ? (
            children
          ) : (
            <GoogleReCaptchaProvider type="v3" siteKey={siteKey}>
              {children}
            </GoogleReCaptchaProvider>
          )}
        </Fragment>
      ) : (
        children
      )}
    </Fragment>
  );
}
