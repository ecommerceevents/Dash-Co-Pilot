import { JsonPropertyDto } from "~/modules/jsonProperties/dtos/JsonPropertyTypeDto";
import { TFunction } from "i18next";
import { JsonPropertiesValuesDto } from "~/modules/jsonProperties/dtos/JsonPropertiesValuesDto";
import { Portal } from "@prisma/client";

export type PortalConfiguration = {
  enabled: boolean;
  forTenants: boolean;
  pricing: boolean;
  analytics: boolean;
  domains?: {
    enabled: boolean;
    provider: "fly";
    portalAppId: string;
    records?: { A: string; AAAA: string };
  };
  metadata: Array<JsonPropertyDto> | undefined;
  pages: Array<PortalPageConfigDto>;
};

export type PortalPageConfigDto = {
  name: string;
  title: string;
  slug: string;
  properties: Array<JsonPropertyDto>;
  errors?: (params: { portal: Portal; page: { attributes: JsonPropertiesValuesDto } | null }) => string[];
};

export function getAppPortalConfiguration({ t }: { t: TFunction }): PortalConfiguration {
  const titleProperty: JsonPropertyDto = {
    name: "title",
    title: t("models.portal.title"),
    type: "string",
    required: true,
  };
  const descriptionProperty: JsonPropertyDto = {
    name: "description",
    title: t("models.portal.description"),
    type: "string",
    required: false,
  };
  const htmlProperty: JsonPropertyDto = {
    name: "html",
    title: t("shared.content"),
    type: "wysiwyg",
    required: true,
  };

  const seoProperties: JsonPropertyDto[] = [
    {
      name: "seoTitle",
      title: t("shared.title"),
      type: "string",
      required: false,
      group: "SEO",
    },
    {
      name: "seoDescription",
      title: t("shared.description"),
      type: "string",
      required: false,
      group: "SEO",
    },
    {
      name: "seoImage",
      title: t("shared.image"),
      type: "image",
      required: false,
      group: "SEO",
    },
  ];

  const conf: PortalConfiguration = {
    enabled: false,
    forTenants: true,
    pricing: true,
    analytics: true,
    domains: {
      enabled: true,
      provider: "fly",
      portalAppId: "saasrock-portal",
      records: {
        A: "66.241.125.25",
        AAAA: "2a09:8280:1::31:5dc2:0",
      },
    },
    metadata: [],
    pages: [
      {
        name: "pricing",
        title: t("models.portal.pages.pricing"),
        slug: "/pricing",
        properties: [titleProperty, descriptionProperty, ...seoProperties],
        errors: (params) => {
          let errors: string[] = [];
          if (!params.portal.stripeAccountId) {
            errors.push("No Stripe account connected");
          }
          return errors;
        },
      },
      {
        name: "privacy-policy",
        title: t("models.portal.pages.privacyPolicy"),
        slug: "/privacy-policy",
        properties: [titleProperty, descriptionProperty, htmlProperty, ...seoProperties],
        errors: (params) => {
          const errors: string[] = [];
          if (!params.page?.attributes?.html) {
            errors.push("No privacy policy content");
          }
          return errors;
        },
      },
      {
        name: "terms-and-conditions",
        title: t("models.portal.pages.termsAndConditions"),
        slug: "/terms-and-conditions",
        properties: [titleProperty, descriptionProperty, htmlProperty, ...seoProperties],
        errors: (params) => {
          const errors: string[] = [];
          if (!params.page?.attributes?.html) {
            errors.push("No terms and conditions content");
          }
          return errors;
        },
      },
    ],
  };

  return conf;
}
