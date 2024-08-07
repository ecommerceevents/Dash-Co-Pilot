import { useTranslation } from "react-i18next";
import { useAppData } from "~/utils/data/useAppData";

interface Props {
  item: { id: string; name: string; slug: string };
  showCurrent?: boolean;
}
export default function TenantBadge({ item, showCurrent }: Props) {
  const { t } = useTranslation();
  const appData = useAppData();
  function isCurrent() {
    return appData.currentTenant?.id === item.id;
  }
  return (
    <div>
      {item.name} {showCurrent && isCurrent() && <span className="text-xs font-normal italic opacity-80">({t("shared.current")})</span>}
    </div>
  );
}
