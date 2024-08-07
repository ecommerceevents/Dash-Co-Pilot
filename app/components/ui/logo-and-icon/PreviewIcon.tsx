import IconLight from "~/assets/img/icon-light.png";
import IconDark from "~/assets/img/icon-dark.png";
import { useRootData } from "~/utils/data/useRootData";

export default function PreviewIcon() {
  const { appConfiguration } = useRootData();
  return (
    <div id="icon" className="w-full space-y-3 lg:grid lg:grid-cols-2 lg:space-y-0">
      <div className="border border-dashed border-gray-300 bg-white p-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center space-y-4 sm:flex-row sm:items-end sm:justify-center sm:space-x-4 sm:space-y-0">
          <img className="mx-auto h-10 w-auto" src={appConfiguration.branding.icon ?? IconLight} alt="Icon" />
        </div>
      </div>

      <div className="border border-dashed border-gray-500 bg-gray-900 p-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center space-y-4 sm:flex-row sm:items-end sm:justify-center sm:space-x-4 sm:space-y-0">
          <img className="mx-auto h-10 w-auto" src={appConfiguration.branding.iconDarkMode ?? appConfiguration.branding.icon ?? IconDark} alt="Icon" />
        </div>
      </div>
    </div>
  );
}
