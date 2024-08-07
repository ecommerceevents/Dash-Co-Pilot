import { PageBlockDto } from "~/modules/pageBlocks/dtos/PageBlockDto";
import BannerBlockPrompt from "../prompts/pageBlocks/BannerBlockPrompt";
import CommunityBlockPrompt from "../prompts/pageBlocks/CommunityBlockPrompt";
import FaqBlockPrompt from "../prompts/pageBlocks/FaqBlockPrompt";
import FeaturesBlockPrompt from "../prompts/pageBlocks/FeaturesBlockPrompt";
import FooterBlockPrompt from "../prompts/pageBlocks/FooterBlockPrompt";
import GalleryBlockPrompt from "../prompts/pageBlocks/GalleryBlockPrompt";
import HeaderBlockPrompt from "../prompts/pageBlocks/HeaderBlockPrompt";
import HeroBlockPrompt from "../prompts/pageBlocks/HeroBlockPrompt";
import LogoCloudsBlockPrompt from "../prompts/pageBlocks/LogoCloudsBlockPrompt";
import NewsletterBlockPrompt from "../prompts/pageBlocks/NewsletterBlockPrompt";
import TestimonialsBlockPrompt from "../prompts/pageBlocks/TestimonialsBlockPrompt";
import { OpenAIDefaults } from "../utils/OpenAIDefaults";
import AIService from "../lib/AIService";
import ContentBlockPrompt from "../prompts/pageBlocks/ContentBlockPrompt";

async function generateBlocks({ blocks, info }: { blocks: PageBlockDto[]; info: string }) {
  let newBlocks = await Promise.all(
    blocks.map(async (block) => {
      return await fillBlock({ block, info });
    })
  );
  return newBlocks;
}

function getBlockPrompt({ block, info }: { block: PageBlockDto; info: string }) {
  let pageContext = `
You're a block-based website builder API.
Based on the following Block Interfaces and Website Metadata, generate the specified block with creative text/copy (don't use the exact website metadata), and return it in the specified output JSON format.
In case there are images, use the placeholder "https://via.placeholder.com/$Widthx$Height?text=$ImageTitle".
Always start the response with '${"```json"}'.

### START: WEBSITE METADATA ###
${info}
### END: WEBSITE METADATA ###`;

  let blockContext = "";
  if (block.hero) {
    blockContext = HeroBlockPrompt;
  } else if (block.header) {
    blockContext = HeaderBlockPrompt;
  } else if (block.banner) {
    blockContext = BannerBlockPrompt;
  } else if (block.logoClouds) {
    blockContext = LogoCloudsBlockPrompt;
  } else if (block.gallery) {
    blockContext = GalleryBlockPrompt;
  } else if (block.features) {
    blockContext = FeaturesBlockPrompt;
  } else if (block.community) {
    blockContext = CommunityBlockPrompt;
  } else if (block.testimonials) {
    blockContext = TestimonialsBlockPrompt;
  } else if (block.newsletter) {
    blockContext = NewsletterBlockPrompt;
  } else if (block.faq) {
    blockContext = FaqBlockPrompt;
  } else if (block.footer) {
    blockContext = FooterBlockPrompt;
  } else if (block.content) {
    blockContext = ContentBlockPrompt;
  } else {
    // // Block not supported
    // var blockName = Object.keys(block).join(", ");
    // throw Error("Block not supported for AI generation: " + blockName);
  }

  if (blockContext) {
    return `${pageContext}\n\n${blockContext}`;
  }
  return undefined;
}

async function fillBlock({ block, info }: { block: PageBlockDto; info: string }) {
  let prompt = getBlockPrompt({ block, info });
  if (!prompt) {
    return block;
  }
  // eslint-disable-next-line no-console
  console.log({ prompt });
  const response = await AIService.createChatCompletion({
    prompt,
    role: "assistant",
    temperature: OpenAIDefaults.temperature,
    model: OpenAIDefaults.model,
  });
  if (response.length === 0) {
    // eslint-disable-next-line no-console
    console.log("No response from OpenAI");
    return block;
  }
  let content = response[0];

  let finishedBlock = parseChatGptContentToBlock(content);
  if (finishedBlock) {
    return finishedBlock;
  }
  return block;
}

function parseChatGptContentToBlock(content: string | undefined) {
  // remove new lines & trailing commas
  content = content?.replace(/\n/g, "");
  content = content?.replace(/,(?!\s*?[{["'\w])/g, ""); // remove all trailing commas (`input` variable holds the erroneous JSON)
  // eslint-disable-next-line no-console
  console.log({ content });
  let jsonContent = content ?? "";
  if (content?.includes("```json")) {
    jsonContent = content?.match(/```json(.*)```/s)?.[1] ?? "";
  } else if (content?.includes("```")) {
    jsonContent = content.split("```")[1] ?? "";
  }
  try {
    // eslint-disable-next-line no-console
    console.log({ jsonContent });
    const block = JSON.parse(jsonContent);
    // eslint-disable-next-line no-console
    console.log({ successfullGeneratedBlock: block });
    return block;
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.log("Could not parse to PageBlockDto", { error, content, jsonContent });
  }
}

export default {
  // getSuggestedBlocks,
  getBlockPrompt,
  generateBlocks,
  fillBlock,
  parseChatGptContentToBlock,
};
