import { PageBlockLoaderArgs } from "~/modules/pageBlocks/dtos/PageBlockLoaderArgs";

export namespace TemplateBlockService {
  export async function load({ block }: PageBlockLoaderArgs) {
    if (block.template) {
      block.template.text = "process.env.APP_NAME: " + process.env.APP_NAME;
    }
  }
}
