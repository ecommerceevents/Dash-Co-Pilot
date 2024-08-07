import { Link } from "@remix-run/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { DefaultFeatures } from "~/application/dtos/shared/DefaultFeatures";
import { SubscriptionFeatureLimitType } from "~/application/enums/subscriptions/SubscriptionFeatureLimitType";
import { CreditTypes } from "~/modules/usage/dtos/CreditType";
import NumberUtils from "~/utils/shared/NumberUtils";

interface Props {
  feature: { name: string; title: string; type: SubscriptionFeatureLimitType; value: number; href?: string | null; badge?: string | null };
  editing?: boolean;
  onClickFeature?: (name: string) => void;
}
export default function PlanFeatureDescription({ feature, editing, onClickFeature }: Props) {
  return (
    <div className="flex items-center">
      {feature.type > 0 && feature.type !== SubscriptionFeatureLimitType.NOT_INCLUDED ? (
        <svg className=" text-primary h-4 w-4 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className=" h-4 w-4 flex-shrink-0 text-gray-300" viewBox="0 0 20 20" stroke="#FFFFF" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {feature.href?.startsWith("http") ? (
        <Fragment>
          {editing ? (
            <div className="hover:text-primary ml-2 truncate text-sm font-medium text-gray-600 underline dark:text-gray-400">
              <FeatureTitle feature={feature} />
            </div>
          ) : (
            <a
              href={feature.href}
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary ml-2 truncate text-sm font-medium text-gray-600 underline dark:text-gray-400"
            >
              <FeatureTitle feature={feature} />
            </a>
          )}
        </Fragment>
      ) : feature.href?.startsWith("/") ? (
        <Fragment>
          {editing ? (
            <div className="hover:text-primary ml-2 truncate text-sm font-medium text-gray-600 underline dark:text-gray-400">
              <FeatureTitle feature={feature} />
            </div>
          ) : (
            <Link to={feature.href} className="hover:text-primary ml-2 truncate text-sm font-medium text-gray-600 underline dark:text-gray-400">
              <FeatureTitle feature={feature} />
            </Link>
          )}
        </Fragment>
      ) : (
        <Fragment>
          {feature.name === DefaultFeatures.Credits && onClickFeature && CreditTypes.length ? (
            <button
              type="button"
              className="hover:text-primary ml-2 truncate text-sm font-medium text-muted-foreground underline"
              onClick={() => onClickFeature(feature.name)}
            >
              <FeatureTitle feature={feature} />
            </button>
          ) : (
            <span className="ml-2 truncate text-sm font-medium text-muted-foreground">
              <FeatureTitle feature={feature} />
            </span>
          )}
        </Fragment>
      )}
    </div>
  );
}

function FeatureTitle({ feature }: { feature: { title: string; value: number; href?: string | null; badge?: string | null } }) {
  const { t } = useTranslation();
  const value = typeof feature.value === "number" ? NumberUtils.intFormat(feature.value) : feature.value;
  return (
    <span>
      {t(feature.title, { 0: value })} {feature.badge && <span className="bg-primary text-theme-50 ml-1 rounded-md px-1 py-0.5 text-xs">{feature.badge}</span>}
    </span>
  );
}
