import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useNavigation } from "@remix-run/react";
import FooterBlock from "~/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import HeaderBlock from "~/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import { getTranslations } from "~/locale/i18next.server";
import CrmService, { NewsletterFormSettings } from "~/modules/crm/services/CrmService";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import OpenSuccessModal from "~/components/ui/modals/OpenSuccessModal";
import OpenErrorModal from "~/components/ui/modals/OpenErrorModal";
import { getCurrentPage } from "~/modules/pageBlocks/services/.server/pagesService";
import PageBlocks from "~/modules/pageBlocks/components/blocks/PageBlocks";
import { PageLoaderData } from "~/modules/pageBlocks/dtos/PageBlockData";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { validateCSRFToken } from "~/utils/session.server";
import { useRootData } from "~/utils/data/useRootData";
import RecaptchaWrapper from "~/components/recaptcha/RecaptchaWrapper";
import IpAddressServiceServer from "~/modules/ipAddress/services/IpAddressService.server";
import UserUtils from "~/utils/app/UserUtils";
import HoneypotInput from "~/components/ui/honeypot/HoneypotInput";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import InputText from "~/components/ui/input/InputText";

type LoaderData = PageLoaderData & {
  settings: NewsletterFormSettings;
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const page = await getCurrentPage({ request, params, slug: "/newsletter" });
  const data: LoaderData = {
    ...page,
    settings: await CrmService.getNewsletterFormSettings(),
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];

type ActionData = {
  error?: string;
  success?: string;
};
export const action: ActionFunction = async ({ request }) => {
  const { t } = await getTranslations(request);

  try {
    await validateCSRFToken(request);
  } catch (e: any) {
    return json({ error: e.message }, { status: 400 });
  }

  const formData = await request.formData();
  const firstName = formData.get("first_name")?.toString() ?? "";
  const lastName = formData.get("last_name")?.toString() ?? "";
  const email = formData.get("email")?.toString() ?? "";
  const source = formData.get("source")?.toString() ?? "";
  const honeypot = formData.get("codeId")?.toString() ?? "";

  if (!email) {
    return json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    await IpAddressServiceServer.log(request, {
      action: "newsletter",
      description: `${firstName} ${lastName} <${email}>`,
      metadata: { source },
      block: UserUtils.isSuspicious({ email, firstName, lastName, honeypot }),
    });
    const subscribed = await CrmService.subscribeToNewsletter({
      firstName,
      lastName,
      email,
      source,
      request,
    });
    if (subscribed.success) {
      return json({ success: t("front.newsletter.checkEmail") }, { status: 200 });
    } else {
      return json({ error: subscribed.error }, { status: 400 });
    }
  } catch (e: any) {
    return json({ error: e.message }, { status: 400 });
  }
};

export default function NewsletterRoute() {
  const { t } = useTranslation();
  const { csrf } = useRootData();
  const [email, setEmail] = useState("");
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<ActionData>();
  const navigation = useNavigation();
  const isSubscribing = navigation.state === "submitting" && navigation.formData?.get("action") === "subscribe";
  const state: "idle" | "success" | "error" | "submitting" =
    navigation.state === "submitting" ? "submitting" : actionData?.success ? "success" : actionData?.error ? "error" : "idle";

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isSubscribing && actionData?.success) {
      formRef.current?.reset();
    }
  }, [actionData?.success, isSubscribing]);

  const [actionResult, setActionResult] = useState<{ error?: string; success?: string } | null>(null);

  useEffect(() => {
    setActionResult(actionData);
  }, [actionData]);

  return (
    <div>
      <div>
        <HeaderBlock />
        <PageBlocks items={data.blocks} />
        <div className="bg-background">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="sm:align-center sm:flex sm:flex-col">
              <div className="relative mx-auto w-full max-w-2xl overflow-hidden px-2 py-12 sm:py-6">
                <div className="text-center">
                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("front.newsletter.title")}</h1>
                  <p className="text-muted-foreground mt-4 text-lg leading-6">{t("front.newsletter.headline")}</p>
                </div>
                <div className="mx-auto mt-12 max-w-xl">
                  {data.settings.error ? (
                    <WarningBanner title={t("shared.error")} text={data.settings.error} />
                  ) : (
                    <div>
                      <RecaptchaWrapper enabled>
                        <Form
                          ref={formRef}
                          replace
                          method="post"
                          aria-hidden={state === "success"}
                          className="mt-9 grid grid-cols-1 gap-x-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4"
                        >
                          <input type="hidden" name="csrf" value={csrf} hidden readOnly />
                          <HoneypotInput />
                          <input name="action" type="hidden" value="subscribe" readOnly hidden />
                          <input name="source" type="hidden" value="newsletter" readOnly hidden />
                          <div>
                            <InputText
                              title={t("front.contact.firstName")}
                              required
                              type="text"
                              name="first_name"
                              id="first_name"
                              autoComplete="given-name"
                              // className="focus:border-theme-300 focus:ring-theme-300 relative block w-full appearance-none rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-slate-200 sm:text-sm"
                              defaultValue=""
                            />
                          </div>
                          <div>
                            <InputText
                              title={t("front.contact.lastName")}
                              type="text"
                              name="last_name"
                              id="last_name"
                              autoComplete="family-name"
                              defaultValue=""
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <div className="mt-1">
                              <InputText
                                title={t("front.contact.email")}
                                required
                                aria-label="Email address"
                                aria-describedby="error-message"
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                setValue={setEmail}
                              />
                            </div>
                          </div>

                          <div className="flex items-baseline justify-between space-x-2 sm:col-span-2">
                            <div>
                              {state === "success" ? (
                                <div>
                                  <p>{t("front.newsletter.checkEmail")}</p>
                                </div>
                              ) : state === "error" ? (
                                <p>{actionData?.error}</p>
                              ) : (
                                <div></div>
                              )}
                            </div>
                            <ButtonPrimary
                              event={{ action: "click", category: "newsletter", label: "subscribe", value: email }}
                              type="submit"
                              disabled={isSubscribing || !email}
                            >
                              {isSubscribing ? t("front.newsletter.subscribing") + "..." : t("front.newsletter.subscribe")}
                            </ButtonPrimary>
                          </div>
                        </Form>
                      </RecaptchaWrapper>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <FooterBlock />
      </div>

      <OpenSuccessModal
        title={t("front.newsletter.subscribed")}
        description={actionResult?.success?.toString() ?? ""}
        open={!!actionResult?.success}
        onClose={() => setActionResult(null)}
      />

      <OpenErrorModal
        title={t("shared.error")}
        description={actionResult?.error?.toString() ?? ""}
        open={!!actionResult?.error}
        onClose={() => setActionResult(null)}
      />
    </div>
  );
}
