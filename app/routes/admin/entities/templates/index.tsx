import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import UnderConstruction from "~/components/ui/misc/UnderConstruction";

type LoaderData = {};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const data: LoaderData = {};
  return json(data);
};

type CreateTemplateType = {
  title: string;
  description: string;
  href: string;
  enterprise?: boolean;
  underConstruction?: boolean;
};

const types: CreateTemplateType[] = [
  {
    title: "Manual",
    description: "Upload a JSON configuration",
    href: "manual",
  },
  {
    title: "Airtable",
    description: "Pull entities from an Airtable base",
    href: "airtable",
    enterprise: true,
    underConstruction: true,
  },
  {
    title: "Notion",
    description: "Pull entities from a Notion database",
    href: "notion",
    enterprise: true,
    underConstruction: true,
  },
];

export default function AdminEntityNoCodeRoute() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
      <div className="md:border-b md:border-gray-200 md:py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-lg font-medium leading-6">Entity Templates</h3>
          {/* <div className="flex items-center space-x-2">
            <InputFilters withSearch={false} filters={data.filterableProperties} />
          </div> */}
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {types.map((item) => {
          return (
            <Link
              key={item.title}
              to={item.href}
              className="relative flex w-full flex-col justify-center space-y-2 rounded-lg border-2 border-dashed border-gray-300 p-3 text-center hover:border-gray-400 focus:border-2 focus:border-gray-600 focus:bg-white focus:outline-none"
            >
              <div className="block text-sm font-medium text-gray-900">
                {item.title} {item.enterprise && <span className="text-xs font-extrabold">(Enterprise 🚀)</span>}
              </div>
              <div className="block text-xs text-gray-500">{item.description}</div>
              {item.underConstruction && <div className="text-xs text-gray-500">Under 🚧 Construction</div>}
            </Link>
          );
        })}
      </div>
      <UnderConstruction
        title="TODO: ENTITY TEMPLATES"
        description="Default entities with properties, relationships, views, webhooks... I'm thinking of letting SaasRock users share their functional templates (long-term), no-code and downloadable custom-code."
      />
    </div>
  );
}
