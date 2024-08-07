import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import { getTranslations } from "~/locale/i18next.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { t } = await getTranslations(request);
  return json({
    metadata: [{ title: `${t("models.tenant.plural")} | ${process.env.APP_NAME}` }],
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.metadata || [];

export default function () {
  return (
    <EditPageLayout
      title="Accounts Settings"
      withHome={false}
      menu={[
        {
          title: "Accounts Settings",
          routePath: "/admin/settings/accounts",
        },
      ]}
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <Link
            to={`types`}
            className="focus:ring-accent-500 relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <span className="mt-2 block text-sm font-medium text-gray-900">Types</span>
          </Link>
        </div>
      </div>
    </EditPageLayout>
  );
}
