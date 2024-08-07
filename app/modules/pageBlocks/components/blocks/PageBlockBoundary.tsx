import { useTranslation } from "react-i18next";
import ErrorBanner from "~/components/ui/banners/ErrorBanner";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import { PageBlockDto } from "~/modules/pageBlocks/dtos/PageBlockDto";
import StringUtils from "~/utils/shared/StringUtils";

export default function PageBlockBoundary({ item }: { item: PageBlockDto }) {
  const { t } = useTranslation();
  function getType() {
    if (!item) {
      return "Not set";
    }
    const keys = Object.keys(item);
    if (keys.length === 0) {
      throw new Error("Invalid block type");
    }
    return keys[0];
  }
  function hasData() {
    // @ts-ignore
    const block = item[getType()];
    if (block) {
      const keys = Object.keys(block);
      if (keys.find((f) => f === "data")) {
        return true;
      }
    }
    return false;
  }
  function getData() {
    // @ts-ignore
    return item[getType()].data;
  }
  return (
    <>
      {item.error ? (
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <ErrorBanner title={t("shared.error")} text={item.error} />
        </div>
      ) : hasData() && !getData() ? (
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <WarningBanner title={StringUtils.capitalize(getType())} text={"Data is not displayed in edit mode."} />
        </div>
      ) : null}
    </>
  );
}
