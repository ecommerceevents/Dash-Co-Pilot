import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import InputFilters from "~/components/ui/input/InputFilters";
import { OutboundEmails_List } from "../../routes/OutboundEmails_List";
import OutboundEmailsTable from "../OutboundEmailsTable";

export default function OutboundEmailsListRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<OutboundEmails_List.LoaderData>();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
      <div className="md:border-b md:border-gray-200 md:py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-lg font-medium leading-6">{t("emailMarketing.activity")}</h3>
          <div className="flex items-center space-x-2">
            <InputFilters withSearch={false} filters={data.filterableProperties} />
          </div>
        </div>
      </div>

      <OutboundEmailsTable allEntities={data.allEntities} items={data.items} pagination={data.pagination} withCampaign={true} />
    </div>
  );
}
