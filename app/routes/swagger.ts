import { LoaderFunctionArgs, json } from "@remix-run/node";
import ApiSpecsService from "~/modules/api/services/ApiSpecsService";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const apiSpecs = await ApiSpecsService.generateSpecs({ request });
  return json(apiSpecs.openApi, { headers: { "Content-Type": "application/json" } });
};
