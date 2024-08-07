import React, { Fragment, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
const TrustpilotBox = ({
  trustpilot,
}: {
  trustpilot: {
    href: string;
    businessUnitId: string;
    templateId: string;
  };
}) => {
  const { i18n } = useTranslation();
  const ref = useRef(null);
  useEffect(() => {
    // If window.Trustpilot is available it means that we need to load the TrustBox from our ref.
    // If it's not, it means the script you pasted into <head /> isn't loaded  just yet.
    // When it is, it will automatically load the TrustBox.
    if (typeof window !== "undefined") {
      // @ts-ignore
      if (window.Trustpilot) {
        // @ts-ignore
        window.Trustpilot.loadFromElement(ref.current, true);
      }
    }
  }, []);
  return (
    <Fragment>
      <div
        ref={ref} // We need a reference to this element to load the TrustBox in the effect.
        className="trustpilot-widget" // Renamed this to className.
        data-locale={i18n.language}
        data-template-id={trustpilot.templateId}
        data-businessunit-id={trustpilot.businessUnitId}
        data-style-height="52px"
        data-style-width="100%"
        data-no-reviews="collapse"
      >
        <a href={trustpilot.href} target="_blank" rel="noopener noreferrer">
          Trustpilot
        </a>
      </div>
    </Fragment>
  );
};
export default TrustpilotBox;
