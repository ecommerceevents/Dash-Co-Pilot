import { LoaderFunctionArgs } from "@remix-run/node";
import { getAllBlogPosts } from "~/modules/blog/db/blog.db.server";

function escapeCdata(s: string) {
  return s.replace(/\]\]>/g, "]]]]><![CDATA[>");
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const posts = await getAllBlogPosts({ tenantId: null, published: true });

  const host = request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");
  if (!host) {
    throw new Error("Could not determine domain URL.");
  }
  const protocol = host.includes("localhost") ? "http" : "https";
  const domain = `${protocol}://${host}`;
  const blogUrl = `${domain}/blog`;

  const rssString = `
    <rss xmlns:blogChannel="${blogUrl}" version="2.0">
      <channel>
        <title>SaasRock - Blog</title>
        <link>${blogUrl}</link>
        <description>Read the latest articles about SaasRock - The Remix SaaS kit</description>
        <language>en-us</language>
        <generator>AlexandroMtzG</generator>
        <ttl>40</ttl>
        ${posts
          .map((post) =>
            `
            <item>
              <title><![CDATA[${escapeCdata(post.slug)}]]></title>
              <description><![CDATA[Blog post - ${escapeHtml(post.title)}]]></description>
              ${!post.author ? "" : `<author><![CDATA[${escapeCdata(post.author.firstName + " " + post.author.lastName)}]]></author>`}
              <pubDate>${post.createdAt.toUTCString()}</pubDate>
              <link>${blogUrl}/${post.slug}</link>
              <guid>${blogUrl}/${post.id}</guid>
            </item>
          `.trim()
          )
          .join("\n")}
      </channel>
    </rss>
  `.trim();

  return new Response(rssString, {
    headers: {
      "Cache-Control": `public, max-age=${60 * 10}, s-maxage=${60 * 60 * 24}`,
      "Content-Type": "application/xml",
      "Content-Length": String(Buffer.byteLength(rssString)),
    },
  });
};
