import { LoaderFunctionArgs } from "@remix-run/node";
import CampaignsListRoute from "~/modules/emailMarketing/components/campaigns/CampaignsListRoute";
import { Campaigns_List } from "~/modules/emailMarketing/routes/Campaigns_List";

export const loader = (args: LoaderFunctionArgs) => Campaigns_List.loader(args);

export default () => <CampaignsListRoute />;
