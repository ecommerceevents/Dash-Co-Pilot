import { TFunction } from "i18next";
import { PageBlockDto } from "~/modules/pageBlocks/dtos/PageBlockDto";
import { defaultFooter } from "../defaultFooter";
import { defaultHeader } from "../defaultHeader";
import Constants from "~/application/Constants";
import { defaultTestimonials } from "../defaultTestimonials";
import { defaultGallery } from "../defaultGallery";
import { defaultFaq } from "../defaultFaq";

export function defaultLandingPage({ t }: { t: TFunction }) {
  const blocks: PageBlockDto[] = [
    // Banner
    {
      banner: {
        style: "top",
        text: "SaasRock demo site.",
        textMd: "This is the SaasRock demo site.",
        cta: [{ text: "SaasRock", href: "https://saasrock.com/?ref=demo.saasrock.com", isPrimary: true, target: "_blank" }],
      },
    },
    // Header
    { header: defaultHeader({ t }) },
    // Hero
    {
      hero: {
        style: "simple",
        headline: t("front.hero.headline1"),
        description: t("front.hero.headline2"),
        image: "https://qwcsbptoezmuwgyijrxp.supabase.co/storage/v1/object/public/novel/1703743532626-analytics%20(2).png",
        cta: [
          {
            text: t("front.hero.buy"),
            href: "/pricing",
            isPrimary: true,
          },
          {
            text: t("front.hero.contact"),
            href: "/contact",
            isPrimary: false,
          },
        ],
        topText: {
          text: t("front.hero.subheadline1"),
          // link: { text: t("front.hero.changelog"), href: "/changelog" },
        },
        bottomText: {
          link: {
            text: t("front.hero.hint", { 0: `v${Constants.VERSION}` }),
            href: "/changelog",
          },
        },
      },
    },
    // Logo Clouds
    {
      logoClouds: {
        style: "custom",
        headline: t("front.logoClouds.title"),
        logos: [
          {
            alt: "Remix",
            href: "https://remix.run/ref=saasrock.com",
            src: "https://yahooder.sirv.com/saasrock/logos/clouds/colors/remix.png",
          },
          {
            alt: "Tailwind CSS",
            href: "https://tailwindcss.com/ref=saasrock.com",
            src: "https://yahooder.sirv.com/saasrock/logos/clouds/colors/tailwindcss.png",
          },
          {
            alt: "Prisma",
            href: "https://www.prisma.io/?via=alexandro",
            src: "https://yahooder.sirv.com/saasrock/logos/clouds/colors/prisma.png",
          },
        ],
      },
    },
    // Gallery
    {
      layout: {
        padding: { y: "py-12" },
      },
      gallery: {
        style: "carousel",
        topText: "Don't build from scratch",
        headline: "Build, Market, Manage your SaaS",
        subheadline:
          "Marketing pages (Landing, Blog, Pricing), App pages (Dashboard, Account Settings), and Admin pages (Tenant/Users, Pricing, Entity Builder, Blog posts, CRM, Email marketing, and more).",
        items: defaultGallery,
      },
    },
    // Features
    {
      features: {
        style: "cards",
        topText: "Powered by the best tools",
        headline: "The Remix SaaS Boilerplate",
        subheadline: "Launch a SaaS MVP (Minimum Viable Product) using a battle-tested tech stack.",
        cta: [
          { text: "Pricing", isPrimary: true, href: "/pricing" },
          { text: "Contact", isPrimary: false, href: "/contact" },
        ],
        grid: {
          columns: "4",
          gap: "sm",
        },
        items: [
          // {
          //   name: "Remix v2",
          //   description: "Focused on web standards and modern web app UX.",
          //   link: { text: t("shared.readDocs"), href: "https://remix.run/docs/en/main?ref=saasrock.com", target: "_blank" },
          // },
          // {
          //   name: "React v18",
          //   description: "A JavaScript library for building user interfaces.",
          //   link: { text: t("shared.readDocs"), href: "https://react.dev/?ref=saasrock.com", target: "_blank" },
          // },
          // {
          //   name: "Tailwind CSS v3",
          //   description: "The best utility-first CSS framework.",
          //   link: { text: t("shared.readDocs"), href: "https://tailwindcss.com/docs/utility-first?ref=saasrock.com", target: "_blank" },
          // },
          // {
          //   name: "Vite v5",
          //   description: "Next Generation Frontend Tooling.",
          //   link: { text: t("shared.readDocs"), href: "https://vitejs.dev/guide/?ref=saasrock.com", target: "_blank" },
          // },
          // {
          //   name: "Prisma v5",
          //   description: "Next-generation Node.js and TypeScript ORM.",
          //   link: { text: t("shared.readDocs"), href: "https://www.prisma.io/docs?ref=saasrock.com", target: "_blank" },
          // },
          // {
          //   name: "Stripe",
          //   description: "The best payment processor out there.",
          //   link: { text: t("shared.readDocs"), href: "https://stripe.com/docs?ref=saasrock.com", target: "_blank" },
          // },
          // {
          //   name: "Postmark",
          //   description: "Email delivery for web apps, done right.",
          //   link: { text: t("shared.readDocs"), href: "https://postmarkapp.com/support?ref=saasrock.com", target: "_blank" },
          // },
          // {
          //   name: "Novu",
          //   description: "The open-source notification infrastructure",
          //   // link: { text: t("shared.readDocs"), href: "https://novu.co//support?ref=saasrock.com", target: "_blank" },
          // },
          {
            name: "Admin Dashboard",
            description: "Manage your tenants, users, blog, analytics, logs, subscriptions, and more.",
            img: `https://qwcsbptoezmuwgyijrxp.supabase.co/storage/v1/object/public/novel/1703743532626-analytics%20(2).png`,
            link: { text: t("shared.learnMore"), href: "/docs/articles/admin-portal" },
            subFeatures: [{ name: "Manage: Accounts, Users..." }, { name: "Market: Blog, Email Marketing..." }, { name: "Build: Entities, Workflows..." }],
            highlight: { text: "40 hours saved" },
          },
          {
            name: "Stripe Subscriptions",
            description: "Stripe Flat-rate, Per-seat, One-time, and Usage-based pricing models + coupons.",
            img: `https://qwcsbptoezmuwgyijrxp.supabase.co/storage/v1/object/public/novel/1704917949886-my-subscription.png`,
            link: { text: t("shared.learnMore"), href: "/docs/articles/subscriptions" },
            subFeatures: [{ name: "Flat-rate & Per-seat" }, { name: "Usage-based" }, { name: "One-time" }],
            highlight: { text: "100 hours saved" },
            logos: {
              title: "Powered by",
              items: [
                {
                  name: "Stripe",
                  img: "https://yahooder.sirv.com/saasrock/logos/stripe.png",
                },
              ],
            },
          },
          {
            name: "App Portal",
            description: "The end-user portal with the core features of your SaaS.",
            img: `https://qwcsbptoezmuwgyijrxp.supabase.co/storage/v1/object/public/novel/1703830927472-app-portal-dashboard.png`,
            link: { text: t("shared.learnMore"), href: "/docs/articles/app-portal" },
            subFeatures: [{ name: "Dashboard" }, { name: "Members & Subscription" }, { name: "User & Account Settings" }],
            highlight: { text: "40 hours saved" },
            // logos: {
            //   title: "Replaces",
            //   items: [
            //     {
            //       name: "Auth0",
            //       img: "data:image/png;base64,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",
            //     },
            //   ],
            // },
          },
          {
            name: "No-code Entity Builder",
            description: "Custom entities/properties with autogenerated CRUD, Views, API, and more.",
            img: `https://qwcsbptoezmuwgyijrxp.supabase.co/storage/v1/object/public/novel/1704595476624-entities.png`,
            link: { text: t("shared.learnMore"), href: "/docs/articles/entity-builder" },
            subFeatures: [{ name: "Custom Properties" }, { name: "Autogenerated CRUD & API" }, { name: "Workflow Events" }],
            highlight: { text: "80 hours saved" },
            // logos: {
            //   title: "Replaces",
            //   items: [
            //     {
            //       name: "Code",
            //       // img: "https://yahooder.sirv.com/saasrock/logos/postman.png",
            //     },
            //   ],
            // },
          },
        ],
      },
    },
    // Pricing
    {
      pricing: {
        style: "simple",
        headline: t("front.pricing.title"),
        subheadline: t("front.pricing.headline"),
      },
    },
    // Community
    {
      community: {
        style: "simple",
        headline: "Join the SaasRock community!",
        subheadline: "We're all looking to build successful SaaS applications.",
        withName: false,
        // grid: {
        //   columns: "12",
        //   gap: "sm",
        // },
        cta: [
          {
            text: "Subscribe",
            href: "/pricing",
          },
          {
            text: "Join Discord",
            href: "https://discord.gg/KMkjU2BFn9",
          },
          {
            text: "Youtube channel",
            href: "https://www.youtube.com/@saasrock",
          },
        ],
      },
    },
    // Testimonials
    {
      testimonials: {
        style: "simple",
        headline: "Read what our clients have to say",
        subheadline: `You'll want to build every SaaS idea on your backlog!`,
        items: defaultTestimonials,
      },
    },
    // Newsletter
    {
      newsletter: {
        style: "simple",
        headline: t("front.newsletter.title"),
        subheadline: t("front.newsletter.headline"),
      },
    },
    // Faq
    {
      faq: {
        style: "simple",
        headline: t("front.faq.title"),
        subheadline: t("front.faq.subheadline"),
        items: defaultFaq({ t }),
      },
    },
    // Footer
    {
      footer: defaultFooter({ t }),
    },
  ];
  return blocks;
}
