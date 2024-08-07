import { CookieCategory } from "./CookieCategory";

export type ApplicationCookie = {
  category: CookieCategory;
  name: string;
  domain?: string;
  expiry?: string;
  description?: string;
  type?: "http" | "https";
  href?: string;
};
