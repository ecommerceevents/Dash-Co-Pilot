import { json, LoaderFunctionArgs } from "@remix-run/node";
import Page404 from "~/components/pages/Page404";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({});
};
export default function Route404() {
  return (
    <>
      <Page404 />
    </>
  );
}
