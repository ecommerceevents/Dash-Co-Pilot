import { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import SendersNewRoute from "~/modules/emailMarketing/components/senders/SendersNewRoute";
import { Senders_New } from "~/modules/emailMarketing/routes/Senders_New";

export const loader = (args: LoaderFunctionArgs) => Senders_New.loader(args);
export const action: ActionFunction = (args) => Senders_New.action(args);

export default () => <SendersNewRoute />;
