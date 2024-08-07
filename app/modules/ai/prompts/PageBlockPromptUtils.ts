import { PageBlockDto } from "~/modules/pageBlocks/dtos/PageBlockDto";
import { PageConfiguration } from "~/modules/pageBlocks/dtos/PageConfiguration";
import { getDefaultSiteTags } from "~/modules/pageBlocks/utils/defaultSeoMetaTags";

const siteTags = getDefaultSiteTags();
function getDefaultPrompt(page: PageConfiguration | undefined, block?: PageBlockDto) {
  let pageContext = "";
  if (block) {
    pageContext = `Based on the following SEO metatags, generate a page block:\n\n`;
  } else {
    pageContext = `Based on the following SEO metatags, generate a page:\n\n`;
  }
  if (page?.page?.metaTags) {
    pageContext += page.page.metaTags.map((p) => `${p.name}: ${p.value}`).join("\n");
  } else {
    pageContext += [
      { name: "Website Title", value: siteTags.title },
      { name: "Website Description", value: siteTags.description },
      { name: "Website Keywords", value: siteTags.keywords },
      { name: "Website Image", value: siteTags.image },
      { name: "Page Details", value: "" },
    ]
      .map((p) => `${p.name}: ${p.value}`)
      .join("\n");
  }

  return pageContext;
}

const maxTokens = 2048;

export default {
  getDefaultPrompt,
  maxTokens,
};
