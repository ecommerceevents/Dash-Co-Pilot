import { Outlet } from "@remix-run/react";
import ServerError from "~/components/ui/errors/ServerError";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";

export default () => {
  return (
    <EditPageLayout title={`No-code Routes & Blocks`} menu={[{ title: "No-code", routePath: "/admin/entities/no-code" }]} withHome={false}>
      <div className="h-[calc(100vh-200px)] overflow-y-auto rounded-lg border-2 border-dashed border-gray-800 bg-gray-50 sm:h-[calc(100vh-160px)]">
        <Outlet />
      </div>
    </EditPageLayout>
  );
};

export function ErrorBoundary() {
  return <ServerError />;
}
