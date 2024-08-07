import { json, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DateCell from "~/components/ui/dates/DateCell";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import TableSimple from "~/components/ui/tables/TableSimple";

export const meta: MetaFunction = () => {
  return [{ title: "Supabase Playground" }];
};

type LoaderData = {
  supabaseConfig: {
    url?: string;
    key?: string;
  };
};
export const loader = async () => {
  const data: LoaderData = {
    supabaseConfig: {
      url: process.env.SUPABASE_API_URL,
      key: process.env.SUPABASE_ANON_PUBLIC_KEY,
    },
  };
  return json(data);
};

// type ActionData = {
//   success?: string;
//   error?: string;
// };
// export const action: ActionFunction = async ({ request }) => {
//   const form = await request.formData();
//   const action = form.get("action");
//   if (action === "") {
//     return json({success: ""})
//   } else {
//     return json({ error: "Invalid action" }, { status: 400 });
//   }
// };

export default function () {
  const { t } = useTranslation();
  const data = useLoaderData<LoaderData>();

  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient>();
  const [items, setItems] = useState<
    {
      createdAt: Date;
      schema: string;
      table: string;
      commit_timestamp: string;
      errors: string[];
      eventType: string;
      new: string;
      old: string;
    }[]
  >([]);

  useEffect(() => {
    if (data.supabaseConfig.url && data.supabaseConfig.key) {
      const supabaseClient = createClient(data.supabaseConfig.url, data.supabaseConfig.key);
      // eslint-disable-next-line no-console
      console.log("[Supabase] Init", supabaseClient);
      setSupabaseClient(supabaseClient);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (supabaseClient) {
      subscribeToChannel({ channel: "public:User", table: "User" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseClient]);

  function subscribeToChannel({ channel, table }: { channel: string; table: string }) {
    supabaseClient
      ?.channel(channel)
      .on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
        const newItems = [...items];
        newItems.unshift({
          createdAt: new Date(),
          schema: payload.schema,
          table: payload.table,
          commit_timestamp: payload.commit_timestamp,
          errors: payload.errors,
          eventType: payload.eventType,
          new: JSON.stringify(payload.new),
          old: JSON.stringify(payload.old),
        });
        setItems(newItems);
      })
      .subscribe();
    // eslint-disable-next-line no-console
    console.log("[Supabase] Subscribed to channel");
  }

  return (
    <IndexPageLayout title="Supabase Playground">
      <TableSimple
        items={items}
        headers={[
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (i) => <DateCell date={i.createdAt} />,
          },
          {
            name: "schema",
            title: "schema",
            value: (i) => i.schema,
          },
          {
            name: "table",
            title: "table",
            value: (i) => i.table,
          },
          {
            name: "eventType",
            title: "eventType",
            value: (i) => i.eventType,
          },
          {
            name: "new",
            title: "new",
            value: (i) => i.new,
          },
          {
            name: "old",
            title: "old",
            value: (i) => i.old,
          },
          {
            name: "errors",
            title: "errors",
            value: (i) => i.errors.join("\n"),
          },
        ]}
      />
      {/* <ActionResultModal actionData={actionData} showSuccess={true} /> */}
    </IndexPageLayout>
  );
}
