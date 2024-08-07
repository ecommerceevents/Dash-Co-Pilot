import { useParams, useSearchParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import SentIconFilled from "~/components/ui/icons/emails/SentIconFilled";
import TableSimple from "~/components/ui/tables/TableSimple";
import TabsWithIcons from "~/components/ui/tabs/TabsWithIcons";
import NumberUtils from "~/utils/shared/NumberUtils";
import { Campaigns_List } from "../../routes/Campaigns_List";

export default function CampaignsListRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<Campaigns_List.LoaderData>();
  const params = useParams();
  const [searchParams] = useSearchParams();

  function countStatus(status?: string) {
    if (!status) {
      let total = 0;
      data.groupByStatus.forEach((item) => {
        total += item.count;
      });
      return total;
    }
    const item = data.groupByStatus.find((item) => item.status === status);
    return item ? item.count : 0;
  }
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="flex items-center justify-between space-x-2">
        <div className="flex-grow">
          <TabsWithIcons
            tabs={[
              {
                name: `All ${countStatus() ? `(${countStatus()})` : ""}`,
                href: "?",
                current: !searchParams.get("status") || searchParams.get("status") === "all",
              },
              {
                name: `Draft ${countStatus("draft") ? `(${countStatus("draft")})` : ""}`,
                href: "?status=draft",
                current: searchParams.get("status") === "draft",
              },
              {
                name: `Sending ${countStatus("sending") ? `(${countStatus("sending")})` : ""}`,
                href: "?status=sending",
                current: searchParams.get("status") === "sending",
              },
              {
                name: `Incomplete ${countStatus("incomplete") ? `(${countStatus("incomplete")})` : ""}`,
                href: "?status=incomplete",
                current: searchParams.get("status") === "incomplete",
              },
              {
                name: `Completed ${countStatus("completed") ? `(${countStatus("completed")})` : ""}`,
                href: "?status=completed",
                current: searchParams.get("status") === "completed",
              },
            ]}
          />
        </div>
        <div>
          <ButtonPrimary to="new">
            <div>New</div>
            <SentIconFilled className="h-5 w-5" />
          </ButtonPrimary>
        </div>
      </div>

      {data.emailSenders.length === 0 && (
        <WarningBanner
          title={t("shared.warning")}
          text="You need to create an email sender before you can create a campaign."
          redirect={params.tenant ? `/app/${params.tenant}/email-marketing/senders` : "/admin/email-marketing/senders"}
        />
      )}

      <TableSimple
        items={data.items}
        actions={[
          {
            title: t("shared.overview"),
            onClickRoute: (_, i) => `${i.id}`,
          },
        ]}
        headers={[
          {
            name: "campaign",
            title: "Campaign",
            value: (i) => (
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <div className="text-base font-bold">{i.name}</div>
                  <div>
                    <CampaignStatusBadge status={i.status} />
                  </div>
                  {i.sentAt ? (
                    <>
                      <div>•</div>
                      <div className="text-sm text-gray-500">
                        <span>{i.sentAt.toLocaleDateString()}</span>
                      </div>
                    </>
                  ) : null}
                </div>
                <div className="flex items-center space-x-2">
                  <div>{i.recipients.length} recipients</div>
                  {i.track && (
                    <>
                      <div>•</div>
                      <div className="text-sm text-gray-500">
                        {i.recipients.filter((f) => f.deliveredAt).length}/{i.recipients.length} {t("emails.delivered")}
                      </div>
                    </>
                  )}
                  {i.track && (
                    <>
                      <div>•</div>
                      <div className="text-sm text-gray-500">
                        {NumberUtils.decimalFormat((i.recipients.filter((f) => f.opens.length > 0).length / i.recipients.length) * 100)}% open rate
                      </div>
                    </>
                  )}
                  {i.track && (
                    <>
                      <div>•</div>
                      <div className="text-sm text-gray-500">
                        {NumberUtils.decimalFormat((i.recipients.filter((f) => f.clicks.length > 0).length / i.recipients.length) * 100)}% click rate
                      </div>
                      <div>•</div>
                      <div className="text-sm text-gray-500">{i.recipients.filter((f) => f.clicks.length > 0).length} clicks</div>
                    </>
                  )}
                  {i.track && (
                    <>
                      <div>•</div>
                      <div className="text-sm text-gray-500">{i.recipients.filter((f) => f.unsubscribedAt).length} unsubscribers</div>
                    </>
                  )}
                </div>
              </div>
            ),
          },
        ]}
        noRecords={
          <div className="p-12 text-center">
            <h3 className="mt-1 text-sm font-medium text-gray-900">No campaigns</h3>
            <p className="mt-1 text-sm text-gray-500">Create a campaign to start sending emails.</p>
          </div>
        }
      />
    </div>
  );
}

function CampaignStatusBadge({ status }: { status: string }) {
  return (
    <>
      {status === "draft" && <SimpleBadge title={status} color={Colors.YELLOW} />}
      {status === "sending" && <SimpleBadge title={status} color={Colors.ORANGE} />}
      {status === "incomplete" && <SimpleBadge title={status} color={Colors.RED} />}
      {status === "completed" && <SimpleBadge title={status} color={Colors.GREEN} />}
    </>
  );
}
