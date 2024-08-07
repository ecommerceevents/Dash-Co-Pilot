import { useLocation } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import IconHistory from "~/components/layouts/icons/IconHistory";
import ShareIcon from "~/components/ui/icons/crud/ShareIcon";
import TagsIcon from "~/components/ui/icons/crud/TagsIcon";
import TabsWithIcons, { TabWithIcon } from "~/components/ui/tabs/TabsWithIcons";

export default function RowSettingsTabs({ canUpdate, isOwner, hasTags = true }: { canUpdate: boolean; isOwner: boolean; hasTags: boolean }) {
  const { t } = useTranslation();
  const location = useLocation();
  function isCurrent(name: string) {
    return location.pathname.endsWith(name);
  }
  function getTabs() {
    const tabs: TabWithIcon[] = [
      {
        name: t("shared.activity"),
        className: "flex justify-center",
        current: isCurrent("activity"),
        href: "activity",
        icon: <IconHistory className="h-6 w-6" />,
      },
    ];
    if (canUpdate && hasTags) {
      tabs.push({
        name: t("models.row.tags"),
        className: "flex justify-center",
        current: isCurrent("tags"),
        href: "tags",
        icon: <TagsIcon className="h-5 w-5" />,
      });
    }
    if (isOwner) {
      tabs.push({
        name: t("shared.share"),
        className: "flex justify-center",
        current: isCurrent("share"),
        href: "share",
        icon: <ShareIcon className="h-5 w-5" />,
      });
    }
    return tabs;
  }
  return <>{getTabs().length > 1 && <TabsWithIcons justify="center" tabs={getTabs()} />}</>;
}
