import { OpenAIDefaults } from "~/modules/ai/utils/OpenAIDefaults";
import { CreatePromptFlowDto } from "../db/promptFlows.db.server";

function myTemplates(): CreatePromptFlowDto[] {
  const websiteGeneratorTemplates = {
    productName: "Generate a unique and catchy product name for my idea: {{idea}}",
    domainName: "Give me a domain name for my idea {{idea}}, named {{promptFlow.results[0]}}",
    keyFeatures:
      "List three key features for my {{idea}}, with product name ({{promptFlow.results[0]}}) and domain name ({{promptFlow.results[1]}}) that make it stand out in the market",
    callToAction:
      "Create a persuasive call to action for my {{idea}}, with product name ({{promptFlow.results[0]}}), domain name ({{promptFlow.results[1]}}), and features ({{promptFlow.results[2]}}) product that encourages potential customers to make a purchase",
  };
  return [
    {
      model: OpenAIDefaults.model,
      stream: false,
      title: "Website Idea Generator",
      description: "Generate a website idea",
      actionTitle: "Generate Website",
      executionType: "sequential",
      isPublic: true,
      promptFlowGroupId: null,
      inputEntityId: null,
      templates: [
        {
          order: 1,
          template: websiteGeneratorTemplates.productName,
          title: "Product Name",
          temperature: OpenAIDefaults.temperature,
          maxTokens: OpenAIDefaults.maxTokens,
        },
        {
          order: 2,
          template: websiteGeneratorTemplates.domainName,
          title: "Domain Name",
          temperature: OpenAIDefaults.temperature,
          maxTokens: OpenAIDefaults.maxTokens,
        },
        {
          order: 3,
          template: websiteGeneratorTemplates.keyFeatures,
          title: "Key Features",
          temperature: OpenAIDefaults.temperature,
          maxTokens: OpenAIDefaults.maxTokens,
        },
        {
          order: 4,
          template: websiteGeneratorTemplates.callToAction,
          title: "Call To Action",
          temperature: OpenAIDefaults.temperature,
          maxTokens: OpenAIDefaults.maxTokens,
        },
      ],
    },
  ];
}

export default {
  myTemplates,
};
