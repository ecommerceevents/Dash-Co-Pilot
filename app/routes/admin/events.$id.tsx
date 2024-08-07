import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import EventDetails from "~/modules/events/components/EventDetails";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import UrlUtils from "~/utils/app/UrlUtils";
import { EventWithDetails, getEvent } from "~/modules/events/db/events.db.server";

type LoaderData = {
  item: EventWithDetails;
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const item = await getEvent(params.id ?? "");
  if (!item) {
    throw redirect(UrlUtils.getModulePath(params, "logs/events"));
  }

  const data: LoaderData = {
    item,
  };
  return json(data);
};

export default function AdminEventDetailsRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  return (
    <EditPageLayout
      title={t("models.event.object")}
      menu={[
        {
          title: "Events",
          routePath: "/admin/events",
        },
        {
          title: "Details",
          routePath: "/admin/events/" + data.item.id,
        },
      ]}
    >
      <EventDetails item={data.item} />
    </EditPageLayout>
  );
}
