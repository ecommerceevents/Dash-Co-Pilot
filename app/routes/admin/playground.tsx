import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import SidebarIconsLayout from "~/components/ui/layouts/SidebarIconsLayout";

type LoaderData = {
  title: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const data: LoaderData = {
    title: `Playground | ${process.env.APP_NAME}`,
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default () => {
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: "Introduction",
          href: "/admin/playground",
          exact: true,
        },
        {
          name: "CRUD Examples",
          href: "/admin/playground/crud",
        },
        {
          name: "Long Running Tasks",
          href: "/admin/playground/long-running-tasks",
        },
        {
          name: "Supabase Storage",
          href: "/admin/playground/supabase/storage/buckets",
        },
        {
          name: "ChatGPT",
          href: "/admin/playground/ai/openai/chatgpt",
        },
        {
          name: "Monaco Editor",
          href: "/admin/playground/monaco-editor",
        },
        {
          name: "Novel Editor",
          href: "/admin/playground/novel-editor",
        },
        {
          name: "Row Repositories and Models",
          href: "/admin/playground/repositories-and-models",
        },
        {
          name: "Handlebars.js",
          href: "/admin/playground/handlebars",
        },
        {
          name: "Chat",
          href: "/admin/playground/chat",
        },
      ]}
    >
      <div className="mx-auto p-4">
        <div className="rounded-md border-2 border-dashed border-gray-300">
          <Outlet />
        </div>
      </div>
    </SidebarIconsLayout>
  );
};
