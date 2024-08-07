import { useTranslation } from "react-i18next";
import { Link } from "@remix-run/react";
import { NewsletterBlockDto } from "~/modules/pageBlocks/components/blocks/marketing/newsletter/NewsletterBlockUtils";
import { useTypedFetcher } from "remix-typedjson";
import { useRootData } from "~/utils/data/useRootData";
import RecaptchaWrapper from "~/components/recaptcha/RecaptchaWrapper";
import HoneypotInput from "~/components/ui/honeypot/HoneypotInput";
import InputText from "~/components/ui/input/InputText";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import { useState } from "react";

export default function NewsletterVariantRightForm({ item }: { item: NewsletterBlockDto }) {
  const { csrf } = useRootData();
  const { t } = useTranslation();
  const fetcher = useTypedFetcher<{ success?: string; error?: string }>();
  const state: "idle" | "success" | "error" | "submitting" =
    fetcher.state === "submitting" ? "submitting" : fetcher.data?.success ? "success" : fetcher.data?.error ? "error" : "idle";

  const [email, setEmail] = useState("");
  return (
    <section className="body-font w-full">
      <div className="container mx-auto flex flex-wrap items-center px-5 py-24">
        <div className="pr-0 md:w-1/2 md:pr-16 lg:w-3/5 lg:pr-0">
          {item.headline && <h1 className="title-font text-3xl font-medium ">{t(item.headline)}</h1>}
          {item.subheadline && <p className="mt-4 leading-relaxed">{t(item.subheadline)}</p>}
        </div>
        <RecaptchaWrapper enabled>
          <fetcher.Form
            method="post"
            action="/newsletter"
            className=" border-border mt-10 flex w-full flex-col rounded-lg border-2 p-8 md:ml-auto md:mt-0 md:w-1/2 lg:w-2/6"
          >
            <input type="hidden" name="csrf" value={csrf} hidden readOnly />
            <HoneypotInput />
            <input type="hidden" name="source" value="right form block" hidden readOnly />
            <h2 className="title-font mb-5 text-lg font-medium ">Sign Up</h2>
            <div className="relative mb-4">
              {/* <label htmlFor="email" className="text-sm leading-7 ">
                {t("front.newsletter.email")} <span className="ml-1 text-red-500">*</span>
              </label> */}
              <InputText
                type="text"
                title={t("front.newsletter.email")}
                id="email"
                name="email"
                required
                value={email}
                setValue={(e) => setEmail(e)}
                // className="focus:border-theme-500 focus:ring-theme-200 dark:focus:ring-theme-800 w-full rounded border border-gray-300 bg-white bg-opacity-50 px-3 py-1 text-base leading-8 text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:bg-transparent focus:ring-2 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400"
              />
            </div>
            <div className="relative mb-4">
              {/* <label htmlFor="first_name" className="text-sm leading-7 ">
                {t("front.newsletter.firstName")} <span className="ml-1 text-red-500">*</span>
              </label> */}
              <InputText
                type="text"
                title={t("front.newsletter.firstName")}
                id="first_name"
                name="first_name"
                required
                defaultValue=""
                // className="focus:border-theme-500 focus:ring-theme-200 dark:focus:ring-theme-800 w-full rounded border border-gray-300 bg-white bg-opacity-50 px-3 py-1 text-base leading-8 text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:bg-transparent focus:ring-2 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400"
              />
            </div>
            <div className="relative mb-4">
              {/* <label htmlFor="last_name" className="text-sm leading-7 ">
                {t("front.newsletter.lastName")} <span className="ml-1 text-red-500">*</span>
              </label> */}
              <InputText
                type="text"
                title={t("front.newsletter.lastName")}
                id="last_name"
                name="last_name"
                required
                defaultValue=""
                // className="focus:border-theme-500 focus:ring-theme-200 dark:focus:ring-theme-800 w-full rounded border border-gray-300 bg-white bg-opacity-50 px-3 py-1 text-base leading-8 text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:bg-transparent focus:ring-2 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400"
              />
            </div>
            <div className="flex justify-end">
              <ButtonPrimary
                type="submit"
                event={{ action: "click", category: "newsletter", label: "subscribe", value: email }}
                disabled={!email || state === "submitting"}
                sendEvent={!!email}
                // className="bg-theme-500 hover:bg-theme-600 inline-flex justify-center rounded-md border-0 px-4 py-2 text-base text-white shadow-sm focus:outline-none"
              >
                {state === "submitting" ? t("front.newsletter.subscribing") + "..." : t("front.newsletter.subscribe")}
              </ButtonPrimary>
            </div>
            <div className="mt-3">
              {fetcher.data?.success ? <p>{fetcher.data.success}</p> : fetcher.data?.error ? <p>{fetcher.data.error}</p> : <div className="invisible">...</div>}
            </div>
            <div className="text-muted-foreground mt-3 text-xs">
              {t("front.newsletter.weCare")}{" "}
              <Link to="/privacy-policy" className="font-medium underline">
                {t("front.privacy.title")}
              </Link>
            </div>
          </fetcher.Form>
        </RecaptchaWrapper>
      </div>
    </section>
  );
}
