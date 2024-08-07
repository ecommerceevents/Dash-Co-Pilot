import { OnboardingStep } from "@prisma/client";
import { OnboardingStepBlockDto } from "../blocks/OnboardingBlockUtils";

function parseStepToBlock(step: OnboardingStep) {
  try {
    return JSON.parse(step.block) as OnboardingStepBlockDto;
  } catch (e) {
    return {
      id: "",
      title: "Undefined",
      links: [],
      gallery: [],
      input: [],
    };
  }
}

function getStepDescription(block: OnboardingStepBlockDto) {
  return (
    <div className="flex items-center space-x-2 truncate text-sm">
      <div className="flex-shrink-0 font-medium text-gray-800">{block.title}</div>
      {block.description && (
        <>
          <div className="text-gray-500">•</div>
          <div className="flex-shrink-0 text-gray-600">{block.description}</div>
        </>
      )}
      {block.links.length > 0 && (
        <>
          <div className="text-gray-500">•</div>
          <div className="flex-shrink-0 text-gray-600">{block.links.length} links</div>
        </>
      )}
      {block.gallery.length > 0 && (
        <>
          <div className="text-gray-500">•</div>
          <div className="flex-shrink-0 text-gray-600">{block.gallery.length} gallery items</div>
        </>
      )}
      {block.input.length > 0 && (
        <>
          <div className="text-gray-500">•</div>
          <div className="flex-shrink-0 text-gray-600">{block.input.length} input fields</div>
        </>
      )}
    </div>
  );
}

export default {
  parseStepToBlock,
  getStepDescription,
};
