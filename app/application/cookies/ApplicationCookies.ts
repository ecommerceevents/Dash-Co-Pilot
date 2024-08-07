import { ApplicationCookie } from "./ApplicationCookie";
import { CookieCategory } from "./CookieCategory";

// I used https://www.cookieserve.com/report
const allApplicationCookies: ApplicationCookie[] = [
  {
    category: CookieCategory.REQUIRED,
    name: "RJ_session",
    expiry: "1 month",
    description: "User session for storing user ID, light or dark mode, language, CSRF token and consent",
  },
  {
    category: CookieCategory.REQUIRED,
    name: "_GRECAPTCHA",
    expiry: "5 months 27 days",
    description: "Google reCAPTCHA",
    href: "https://developers.google.com/recaptcha/docs/faq#does-recaptcha-use-cookies",
  },
  {
    category: CookieCategory.FUNCTIONAL,
    name: "crisp-client/*",
    expiry: "6 months",
    description: "Cookies that are required so that the Crisp Chat works and is able to restore a visitor message history.",
    href: "https://help.crisp.chat/en/article/crisp-chatbox-cookie-ip-policy-1147xor/",
  },
  {
    category: CookieCategory.ANALYTICS,
    name: "saasrock_analytics",
    expiry: "1 month",
    type: "https",
    description: "User tracking ID for page views and events. This help us understand how you use the website.",
  },
  {
    category: CookieCategory.ANALYTICS,
    name: "CONSENT",
    domain: ".youtube.com",
    expiry: "2 years",
    description: "YouTube sets this cookie via embedded youtube-videos and registers anonymous statistical data.",
    href: "https://policies.google.com/technologies/cookies",
  },
  {
    category: CookieCategory.ADVERTISEMENT,
    name: "VISITOR_INFO1_LIVE",
    domain: ".youtube.com",
    expiry: "5 months 27 days",
    description: "A cookie set by YouTube to measure bandwidth that determines whether the user gets the new or old player interface.",
    href: "https://policies.google.com/technologies/cookies",
  },
  {
    category: CookieCategory.ADVERTISEMENT,
    name: "YSC",
    domain: ".youtube.com",
    expiry: "Session",
    description: "YSC cookie is set by Youtube and is used to track the views of embedded videos on Youtube pages.",
    href: "https://policies.google.com/technologies/cookies",
  },
  {
    category: CookieCategory.ADVERTISEMENT,
    name: "yt-remote-device-id",
    domain: ".youtube.com",
    expiry: "Never",
    description: "YouTube sets this cookie to store the video preferences of the user using embedded YouTube video.",
    href: "https://policies.google.com/technologies/cookies",
  },
  {
    category: CookieCategory.ADVERTISEMENT,
    name: "yt-remote-connected-devices",
    domain: ".youtube.com",
    expiry: "Never",
    description: "YouTube sets this cookie to store the video preferences of the user using embedded YouTube video.",
    href: "https://policies.google.com/technologies/cookies",
  },
];

const allCookieCategories: CookieCategory[] = [];

allApplicationCookies.forEach((cookie) => {
  if (!allCookieCategories.includes(cookie.category)) {
    allCookieCategories.push(cookie.category);
  }
});

export { allCookieCategories, allApplicationCookies };
