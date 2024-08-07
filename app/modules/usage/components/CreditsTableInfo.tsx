import TableSimple from "~/components/ui/tables/TableSimple";
import { CreditTypes } from "../dtos/CreditType";
import NumberUtils from "~/utils/shared/NumberUtils";
import { useTranslation } from "react-i18next";

export default function CreditsTableInfo() {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{t("models.credit.whatIs")}</h3>
        <p className="text-sm text-gray-600">{t("models.credit.info")}</p>
      </div>
      <TableSimple
        items={CreditTypes}
        headers={[
          {
            name: "name",
            title: t("shared.name"),
            className: "w-full",
            value: (item) => (
              <div className="flex flex-col">
                <div className="font-bold">{item.name}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            ),
          },
          {
            name: "amount",
            title: t("models.credit.plural"),
            align: "right",
            value: (item) => NumberUtils.intFormat(item.amount),
          },
        ]}
      />
    </div>
  );
}
