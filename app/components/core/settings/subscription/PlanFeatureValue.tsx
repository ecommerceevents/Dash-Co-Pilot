import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { SubscriptionFeatureDto } from "~/application/dtos/subscriptions/SubscriptionFeatureDto";
import { SubscriptionFeatureLimitType } from "~/application/enums/subscriptions/SubscriptionFeatureLimitType";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import XIcon from "~/components/ui/icons/XIcon";

interface Props {
  item: SubscriptionFeatureDto | undefined;
}
export default function PlanFeatureValue({ item }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      {item ? (
        <div className="flex items-baseline space-x-1">
          {item.type === SubscriptionFeatureLimitType.INCLUDED && <CheckIcon className={clsx("text-primary h-4 w-4 text-center")} />}
          {item.type === SubscriptionFeatureLimitType.NOT_INCLUDED && <XIcon className={clsx("h-4 w-4 text-center text-gray-300")} />}
          {item.type === SubscriptionFeatureLimitType.MONTHLY && <span className="lowercase text-gray-500">{item.value}/month</span>}
          {item.type === SubscriptionFeatureLimitType.MAX && <span className="lowercase text-gray-500">{item.value}</span>}
          {item.type === SubscriptionFeatureLimitType.UNLIMITED && <span className="lowercase text-gray-500">{t("shared.unlimited")}</span>}
        </div>
      ) : (
        <span className=" text-gray-500">-</span>
      )}
    </div>
  );
}
