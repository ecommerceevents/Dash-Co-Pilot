import { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";

export const meta: MetaFunction = () => {
  return [{ title: "Supabase Playground" }];
};

export default function () {
  return (
    <IndexPageLayout title="Supabase Playground">
      <div className="grid gap-4">
        <Link
          to={`/admin/playground/supabase/storage/buckets`}
          className="relative flex w-full flex-col justify-center space-y-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:border-2 focus:border-gray-600 focus:bg-white focus:outline-none"
        >
          <div className="block text-sm font-medium text-gray-900">Buckets</div>
          <div className="block text-xs text-gray-500">Storage files in buckets</div>
        </Link>
      </div>
    </IndexPageLayout>
  );
}
