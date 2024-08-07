import { PageBlockLoaderArgs } from "~/modules/pageBlocks/dtos/PageBlockLoaderArgs";

export namespace CommunityBlockService {
  export async function load({ block }: PageBlockLoaderArgs) {
    // if (block.community?.type === "github") {
    //   return {
    //     members: await getGitHubSocialProof(),
    //   }
    // }
    return undefined;
  }
}
