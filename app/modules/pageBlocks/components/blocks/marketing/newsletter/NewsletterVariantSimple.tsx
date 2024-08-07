import { useTranslation } from "react-i18next";
import { Link } from "@remix-run/react";
import { NewsletterBlockDto } from "~/modules/pageBlocks/components/blocks/marketing/newsletter/NewsletterBlockUtils";
import { useTypedFetcher } from "remix-typedjson";
import { useRootData } from "~/utils/data/useRootData";
import { useState } from "react";
import RecaptchaWrapper from "~/components/recaptcha/RecaptchaWrapper";
import HoneypotInput from "~/components/ui/honeypot/HoneypotInput";
import InputText from "~/components/ui/input/InputText";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";

export default function NewsletterVariantSimple({ item }: { item: NewsletterBlockDto }) {
  const { t } = useTranslation();
  const { csrf } = useRootData();
  const [email, setEmail] = useState("");
  const fetcher = useTypedFetcher<{ subscription?: string; error?: string; success?: string }>();
  const state: "idle" | "success" | "error" | "submitting" =
    fetcher.state === "submitting" ? "submitting" : fetcher.data?.subscription ? "success" : fetcher.data?.error ? "error" : "idle";

  return (
    <div>
      <section className="body-font">
        <div className="container mx-auto space-y-8 px-5 py-24 sm:space-y-12">
          <div className="space-y-5 text-center sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl">
            {item.headline && <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">{t(item.headline)}</h2>}
            {item.subheadline && <p className="mx-auto max-w-3xl text-center text-xl">{t(item.subheadline)}</p>}
            <div className="text-muted-foreground mt-3 text-sm">
              {t("front.newsletter.weCare")}{" "}
              <Link to="/privacy-policy" className="font-medium underline">
                {t("front.privacy.title")}
              </Link>
            </div>
          </div>
          <RecaptchaWrapper enabled>
            <fetcher.Form method="post" action="/newsletter" className="mx-auto flex w-full max-w-xl flex-col items-end space-y-4 px-8 sm:px-0">
              <input type="hidden" name="csrf" value={csrf} hidden readOnly />
              <HoneypotInput />
              <input type="hidden" name="source" value="block" hidden readOnly />
              <div className="relative w-full flex-grow">
                {/* <label htmlFor="email" className="text-sm leading-7 text-gray-600">
                  {t("front.newsletter.email")} <span className="ml-1 text-red-500">*</span>
                </label> */}
                <InputText
                  title={t("front.newsletter.email")}
                  type="text"
                  id="email"
                  name="email"
                  required
                  value={email}
                  setValue={(e) => setEmail(e)}
                  // className="focus:border-theme-500 focus:ring-theme-200 dark:focus:ring-theme-800 w-full rounded border border-gray-300 bg-gray-100 bg-opacity-50 px-3 py-1 text-base leading-8 text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:bg-transparent focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                />
              </div>
              <div className="flex w-full items-center space-x-4">
                <div className="relative w-1/2 flex-grow">
                  {/* <label htmlFor="first_name" className="text-sm leading-7 text-gray-600">
                    {t("front.newsletter.firstName")} <span className="ml-1 text-red-500">*</span>
                  </label> */}
                  <InputText
                    type="text"
                    title={t("front.newsletter.firstName")}
                    id="first_name"
                    name="first_name"
                    required
                    defaultValue=""
                    // className="focus:border-theme-500 focus:ring-theme-200 dark:focus:ring-theme-800 w-full rounded border border-gray-300 bg-gray-100 bg-opacity-50 px-3 py-1 text-base leading-8 text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:bg-transparent focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  />
                </div>
                <div className="relative w-1/2 flex-grow">
                  {/* <label htmlFor="last_name" className="text-sm leading-7 text-gray-600">
                    {t("front.newsletter.lastName")} <span className="ml-1 text-red-500">*</span>
                  </label> */}
                  <InputText
                    type="text"
                    title={t("front.newsletter.lastName")}
                    id="last_name"
                    name="last_name"
                    required
                    defaultValue=""
                    // className="focus:border-theme-500 focus:ring-theme-200 dark:focus:ring-theme-800 w-full rounded border border-gray-300 bg-gray-100 bg-opacity-50 px-3 py-1 text-base leading-8 text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:bg-transparent focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  />
                </div>
              </div>
              <div className="mt-3 flex w-full items-center justify-between space-x-2">
                <div className="">
                  {fetcher.data?.success ? (
                    <p>{fetcher.data.success}</p>
                  ) : fetcher.data?.error ? (
                    <p>{fetcher.data.error}</p>
                  ) : (
                    <div className="invisible">...</div>
                  )}
                </div>
                <ButtonPrimary
                  event={{ action: "click", category: "newsletter", label: "subscribe", value: email }}
                  type="submit"
                  disabled={!email || state === "submitting"}
                  // className={clsx(
                  //   "bg-theme-500 hover:bg-theme-600 inline-flex justify-center rounded-md border-0 px-4 py-2 text-base text-white shadow-sm focus:outline-none"
                  // )}
                  sendEvent={!!email}
                >
                  {state === "submitting" ? t("front.newsletter.subscribing") + "..." : t("front.newsletter.subscribe")}
                </ButtonPrimary>
              </div>
            </fetcher.Form>
          </RecaptchaWrapper>
        </div>
      </section>

      {/* <section id="entity-builder-demo" className="body-font mx-auto bg-white text-gray-800 sm:max-w-xl lg:max-w-7xl">
        <div className="container mx-auto space-y-8 px-5 py-24 sm:space-y-12">
          <div className="space-y-5 text-center sm:mx-auto sm:space-y-4">
            <div className="space-y-1">
              <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Entity Builder Demo</h2>
            </div>
            <p className="mx-auto max-w-2xl text-center text-xl text-gray-500">Build powerful no-code applications with Entity Builder.</p>
          </div>
          <div className="mt-12">
            <EntityBuilderDemo />
          </div>
        </div>
      </section> */}
    </div>
  );
}
