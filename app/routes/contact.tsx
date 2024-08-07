import FooterBlock from "~/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import HeaderBlock from "~/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import { useEffect, useRef, useState } from "react";
import { ActionFunction, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { getTranslations } from "~/locale/i18next.server";
import OpenSuccessModal from "~/components/ui/modals/OpenSuccessModal";
import OpenErrorModal from "~/components/ui/modals/OpenErrorModal";
import ServerError from "~/components/ui/errors/ServerError";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import CrmService, { ContactFormSettings } from "~/modules/crm/services/CrmService";
import { getCurrentPage } from "~/modules/pageBlocks/services/.server/pagesService";
import PageBlocks from "~/modules/pageBlocks/components/blocks/PageBlocks";
import { PageLoaderData } from "~/modules/pageBlocks/dtos/PageBlockData";
import { useTypedLoaderData } from "remix-typedjson";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import IpAddressServiceServer from "~/modules/ipAddress/services/IpAddressService.server";
import UserUtils from "~/utils/app/UserUtils";
import HoneypotInput from "~/components/ui/honeypot/HoneypotInput";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import InputText from "~/components/ui/input/InputText";
import InputSelect from "~/components/ui/input/InputSelect";

type LoaderData = PageLoaderData & {
  settings: ContactFormSettings;
};
export const handle = { i18n: "translations" };
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "contact");
  const page = await time(getCurrentPage({ request, params, slug: "/contact" }), "getCurrentPage.contact");
  const data: LoaderData = {
    ...page,
    settings: await CrmService.getContactFormSettings(),
  };
  return json(data, { headers: getServerTimingHeader() });
};

type ActionData = {
  error?: string;
  success?: string;
};
export const action: ActionFunction = async ({ request }) => {
  const { t } = await getTranslations(request);
  const form = await request.formData();
  const action = form.get("action");
  if (action === "submission") {
    const submission = {
      firstName: form.get("first_name")?.toString() ?? "",
      lastName: form.get("last_name")?.toString() ?? "",
      email: form.get("email")?.toString() ?? "",
      company: form.get("company")?.toString() ?? "",
      jobTitle: form.get("jobTitle")?.toString() ?? "",
      users: form.get("users")?.toString() ?? "",
      message: form.get("comments")?.toString() ?? "",
      honeypot: form.get("codeId")?.toString() ?? "",
    };
    try {
      await IpAddressServiceServer.log(request, {
        action: "contact",
        description: `${submission.firstName} ${submission.lastName} <${submission.email}>`,
        metadata: submission,
        block: UserUtils.isSuspicious({
          email: submission.email,
          firstName: submission.firstName,
          lastName: submission.lastName,
          honeypot: submission.honeypot,
        }),
      });
      const existingContact = await CrmService.createContactSubmission(submission, request);
      if (existingContact) {
        const data: ActionData = {
          success: t("front.contact.success", { 0: submission.firstName }),
        };
        return json(data, { status: 200 });
      } else {
        const data: ActionData = {
          error: t("front.contact.error"),
        };
        return json(data, { status: 400 });
      }
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else {
    const data: ActionData = {
      error: t("shared.invalidForm"),
    };
    return json(data, { status: 200 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metatags || [];

export default function ContactRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useActionData<{ error?: string; success?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting" && navigation.formData?.get("action") === "submission";

  const formRef = useRef<HTMLFormElement>(null);

  const [actionResult, setActionResult] = useState<{ error?: string; success?: string }>();

  useEffect(() => {
    setActionResult(actionData);
  }, [actionData]);

  useEffect(() => {
    if (!isSubmitting && actionData?.success) {
      formRef.current?.reset();
    }
  }, [actionData?.success, isSubmitting]);

  return (
    <div>
      <div>
        <HeaderBlock />
        <PageBlocks items={data.blocks} />
        <div className="bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="sm:align-center sm:flex sm:flex-col">
              <div className="relative mx-auto w-full max-w-xl overflow-hidden px-2 py-12 sm:py-6">
                <div className="text-center">
                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("front.contact.title")}</h1>
                  <p className="text-muted-foreground mt-4 text-lg leading-6">{t("front.contact.headline")}</p>
                </div>
                {/* <div className="flex justify-center mt-6">
                  <Tabs
                    breakpoint="sm"
                    tabs={[
                      {
                        name: t("blog.title"),
                        routePath: "/blog",
                      },
                      {
                        name: t("front.changelog.title"),
                        routePath: "/changelog",
                      },
                      // {
                      //   name: t("front.newsletter.title"),
                      //   routePath: "/newsletter",
                      // },
                      {
                        name: t("front.contact.title"),
                        routePath: "/contact",
                      },
                    ]}
                  />
                </div> */}
                <div className="mt-12">
                  {data.settings.error ? (
                    <WarningBanner title={t("shared.error")} text={data.settings.error} />
                  ) : data.settings.actionUrl ? (
                    <form ref={formRef} action={data.settings.actionUrl} method="POST">
                      <HoneypotInput name="_gotcha" />
                      <ContactForm />
                    </form>
                  ) : data.settings.crm ? (
                    <Form ref={formRef} method="post">
                      <input type="hidden" name="action" value="submission" hidden readOnly />
                      <HoneypotInput name="codeId" />
                      <ContactForm />
                    </Form>
                  ) : null}
                  <div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <FooterBlock />
      </div>

      <OpenSuccessModal
        title={t("shared.success")}
        description={actionResult?.success?.toString() ?? ""}
        open={!!actionResult?.success}
        onClose={() => setActionResult(undefined)}
      />

      <OpenErrorModal
        title={t("shared.error")}
        description={actionResult?.error?.toString() ?? ""}
        open={!!actionResult?.error}
        onClose={() => setActionResult(undefined)}
      />
    </div>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}

function ContactForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  return (
    <div className="mt-9 grid grid-cols-1 gap-x-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
      <div>
        {/* <label htmlFor="first_name" className="block text-sm font-medium text-gray-900 dark:text-slate-500">
          {t("front.contact.firstName")}
          <span className="ml-1 text-red-500">*</span>
        </label> */}
        <div className="mt-1">
          <InputText
            title={t("front.contact.firstName")}
            required
            type="text"
            name="first_name"
            id="first_name"
            autoComplete="given-name"
            defaultValue=""
            // className="focus:border-theme-300 focus:ring-theme-300 relative block w-full appearance-none rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-slate-200 sm:text-sm"
          />
        </div>
      </div>
      <div>
        {/* <label htmlFor="last_name" className="block text-sm font-medium text-gray-900 dark:text-slate-500">
          {t("front.contact.lastName")}
          <span className="ml-1 text-red-500">*</span>
        </label> */}
        <div className="mt-1">
          <InputText
            title={t("front.contact.lastName")}
            type="text"
            name="last_name"
            id="last_name"
            autoComplete="family-name"
            // className="focus:border-theme-300 focus:ring-theme-300 relative block w-full appearance-none rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-slate-200 sm:text-sm"
            defaultValue=""
          />
        </div>
      </div>
      <div className="sm:col-span-2">
        {/* <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-slate-500">
          {t("front.contact.email")}
          <span className="ml-1 text-red-500">*</span>
        </label> */}
        <div className="mt-1">
          <InputText
            title={t("front.contact.email")}
            required
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            setValue={setEmail}
            // className="focus:border-theme-300 focus:ring-theme-300 relative block w-full appearance-none rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-slate-200 sm:text-sm"
          />
        </div>
      </div>

      <div>
        {/* <div className="flex justify-between">
          <label htmlFor="company" className="block text-sm font-medium text-gray-900 dark:text-slate-500">
            {t("front.contact.organization")}
          </label>
        </div> */}
        <div className="mt-1">
          <InputText
            title={t("front.contact.organization")}
            type="text"
            name="company"
            id="company"
            autoComplete="organization"
            defaultValue=""
            // className="focus:border-theme-300 focus:ring-theme-300 relative block w-full appearance-none rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-slate-200 sm:text-sm"
          />
        </div>
      </div>

      <div>
        {/* <div className="flex justify-between">
          <label htmlFor="company" className="block text-sm font-medium text-gray-900 dark:text-slate-500">
            {t("front.contact.jobTitle")}
          </label>
        </div> */}
        <div className="mt-1">
          <InputText
            title={t("front.contact.jobTitle")}
            type="text"
            name="jobTitle"
            id="organization-title"
            autoComplete="organization-title"
            // className="focus:border-theme-300 focus:ring-theme-300 relative block w-full appearance-none rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-slate-200 sm:text-sm"
            defaultValue=""
          />
        </div>
      </div>

      <fieldset className="sm:col-span-2">
        <legend className="block text-sm font-medium text-gray-900 dark:text-slate-500">{t("front.contact.users")}</legend>
        <div className="mt-4 grid grid-cols-1 gap-y-4">
          <InputSelect
            name="users"
            required
            // className="focus:border-theme-300 focus:ring-theme-300 relative block w-full appearance-none rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-slate-200 sm:text-sm"
            options={["1", "2 - 3", "4 - 10", "11 - 25", "26 - 50", "51 - 100", "+100"].map((option, idx) => ({
              name: option,
              value: option,
            }))}
            defaultValue="1"
          />
        </div>
      </fieldset>

      <div className="sm:col-span-2">
        {/* <div className="flex justify-between">
          <label htmlFor="comments" className="block text-sm font-medium text-gray-900 dark:text-slate-500">
            {t("front.contact.comments")}
            <span className="ml-1 text-red-500">*</span>
          </label>
        </div> */}
        <div className="mt-1">
          <InputText
            title={t("front.contact.comments")}
            required
            id="comments"
            name="comments"
            rows={4}
            // className="focus:border-theme-300 focus:ring-theme-300 relative block w-full appearance-none rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 placeholder-gray-500 focus:z-10 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-slate-200 sm:text-sm"
            value={message}
            setValue={setMessage}
          />
        </div>
      </div>

      <div className="text-right sm:col-span-2">
        <ButtonPrimary
          event={{ action: "click", category: "contact", label: t("front.contact.send"), value: email + ": " + message }}
          type="submit"
          disabled={!email || !message}
        >
          {t("front.contact.send")}
        </ButtonPrimary>
      </div>
    </div>
  );
}
