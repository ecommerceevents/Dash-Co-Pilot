import { LoaderFunctionArgs, json } from "@remix-run/node";
import ApiSpecsService from "~/modules/api/services/ApiSpecsService";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const apiSpecs = await ApiSpecsService.generateSpecs({ request });
  return json(apiSpecs.postmanCollection, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
