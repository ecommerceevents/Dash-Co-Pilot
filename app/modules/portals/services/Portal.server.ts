function getPortalUrl(item: { subdomain: string; domain: string | null }) {
  if (item.domain) {
    if (!item.domain.startsWith("http") && process.env.NODE_ENV === "development") {
      item.domain = `http://${item.domain}`;
    } else if (!item.domain.startsWith("https") && process.env.NODE_ENV === "production") {
      item.domain = `https://${item.domain}`;
    }
    const url = new URL(item.domain);
    let urlString = url.toString();
    // without trailing slash
    if (urlString.endsWith("/")) {
      urlString = urlString.slice(0, -1);
    }
    return urlString;
  }
  if (!process.env.PORTAL_SERVER_URL) {
    throw new Error("PORTAL_SERVER_URL is not defined");
  }
  const portalUrl = new URL(process.env.PORTAL_SERVER_URL);
  let subdomain = item.subdomain;
  subdomain = `${portalUrl.protocol}//${subdomain}.${portalUrl.hostname}`;
  if (portalUrl.port) {
    subdomain += `:${portalUrl.port}`;
  }
  // console.log({ subdomain });
  return subdomain;
}

export default {
  getPortalUrl,
};
