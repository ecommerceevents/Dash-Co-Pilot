import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import HeaderBlock from "~/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import FooterBlock from "~/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { getDefaultSiteTags } from "~/modules/pageBlocks/utils/defaultSeoMetaTags";
import { useTranslation } from "react-i18next";
import { getLinkTags } from "~/modules/pageBlocks/services/.server/pagesService";
import { getTranslations } from "~/locale/i18next.server";
import { Fragment, useState } from "react";
import NumberUtils from "~/utils/shared/NumberUtils";
import { getAppConfiguration } from "~/utils/db/appConfiguration.db.server";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ServerError from "~/components/ui/errors/ServerError";
import { useTypedLoaderData } from "remix-typedjson";
import Page404 from "~/components/pages/Page404";

export const meta: MetaFunction<typeof loader> = ({ data }) => (data && "metatags" in data ? data.metatags : []);

type LoaderData = {
  metatags: MetaTagsDto;
  enabled?: boolean;
  contactEmail?: string;
  affiliates: {
    percentage: number;
    plans: { title: string; price: number }[];
    signUpLink: string;
  };
};
export let loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  const appConfiguration = await getAppConfiguration({ request });
  let affiliatesConfig = appConfiguration.affiliates;
  if (!affiliatesConfig) {
    return json({ enabled: false });
  }
  if (!affiliatesConfig?.provider.rewardfulApiKey) {
    throw Error("[Affiliates] Rewardful API key is not set.");
  } else if (!affiliatesConfig?.percentage) {
    throw Error("[Affiliates] Percentage is not set.");
  } else if (!affiliatesConfig?.plans || affiliatesConfig.plans.length === 0) {
    throw Error("[Affiliates] Plans are not set.");
  } else if (!affiliatesConfig?.signUpLink) {
    throw Error("[Affiliates] SignUp link is not set.");
  }
  const data: LoaderData = {
    metatags: [{ title: `${t("affiliates.program")} | ${getDefaultSiteTags().title}` }, { description: t("affiliates.description") }, ...getLinkTags(request)],
    enabled: true,
    contactEmail: process.env.SUPPORT_EMAIL,
    affiliates: {
      percentage: affiliatesConfig.percentage,
      plans: affiliatesConfig.plans,
      signUpLink: affiliatesConfig.signUpLink,
    },
  };
  return json(data);
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  if ("enabled" in data && !data.enabled) {
    return <Page404 />;
  }
  return (
    <div>
      <div>
        <HeaderBlock />
        <div className="bg-background">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="sm:align-center sm:flex sm:flex-col">
              <div className="relative mx-auto w-full max-w-7xl overflow-hidden px-2 py-12 sm:py-6">
                <div className="mb-10 text-center">
                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("affiliates.program")}</h1>
                  <h2 className="text-muted-foreground mt-4 text-lg leading-6">{t("affiliates.description")}</h2>
                </div>
                <div className="mx-auto max-w-3xl space-y-4">
                  <div>
                    <h3 className="text-xl font-bold">{t("affiliates.how.title")}</h3>
                    <p className="text-muted-foreground mt-2">{t("affiliates.how.description", { 0: data.affiliates.percentage })}</p>
                  </div>

                  <div>
                    <AffiliatesCalculator percentage={data.affiliates.percentage} plans={data.affiliates.plans} />
                  </div>

                  {data.affiliates.signUpLink && (
                    <div className="mt-4">
                      <ButtonPrimary
                        event={{ action: "click", category: "affiliate", label: "sign-up", value: data.affiliates.signUpLink }}
                        to={data.affiliates.signUpLink}
                        target="_blank"
                      >
                        {t("affiliates.signUp")}
                      </ButtonPrimary>
                    </div>
                  )}

                  {data.contactEmail && (
                    <Fragment>
                      <h3 className="text-xl font-bold">{t("front.contact.title")}</h3>
                      <p className="text-muted-foreground mt-1">
                        If you have any questions, contact us at{" "}
                        <a href={`mailto:${data.contactEmail}`} className="text-primary">
                          {data.contactEmail}
                        </a>
                        .
                      </p>
                    </Fragment>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <FooterBlock />
      </div>
    </div>
  );
}

function AffiliatesCalculator({
  percentage,
  plans,
}: {
  percentage: number;
  plans: {
    title: string;
    price: number;
  }[];
}) {
  const [customers, setCustomers] = useState(10);
  const [plan, setPlan] = useState(plans.length > 1 ? plans[1] : plans[0]);

  function getTotal() {
    if (!plan) {
      return 0;
    }
    return customers * plan.price * (percentage / 100);
  }
  if (!plan) {
    return null;
  }
  return (
    <div className="space-y-4">
      <div className="text-lg font-medium">
        You could make <span className="text-xl font-bold">${NumberUtils.intFormat(getTotal())}</span> usd for every{" "}
        <span className="text-xl font-bold">{customers} customers</span> in the{" "}
        <span className="text-xl font-bold">
          <select
            className=" w-36 rounded-lg bg-transparent text-xl font-bold focus:outline-none"
            value={plan.title}
            onChange={(e) => setPlan(plans.find((p) => p.title === e.target.value)!)}
          >
            {plans.map((plan) => (
              <option key={plan.title} value={plan.title}>
                {plan.title}
              </option>
            ))}
          </select>
        </span>{" "}
        plan.
      </div>
      <div className="w-full">
        <input
          type="range"
          min="1"
          max="50"
          value={customers}
          onChange={(e) => setCustomers(parseInt(e.target.value))}
          className="bg-secondary text-secondary-foreground h-4 w-full appearance-none overflow-hidden rounded-lg focus:outline-none"
        />
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
