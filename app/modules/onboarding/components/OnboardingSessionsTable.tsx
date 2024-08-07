import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import TenantCell from "~/components/core/tenants/TenantCell";
import UserBadge from "~/components/core/users/UserBadge";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import DateCell from "~/components/ui/dates/DateCell";
import XIcon from "~/components/ui/icons/XIcon";
import ShowPayloadModalButton from "~/components/ui/json/ShowPayloadModalButton";
import Modal from "~/components/ui/modals/Modal";
import TableSimple from "~/components/ui/tables/TableSimple";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import DateUtils from "~/utils/shared/DateUtils";
import { OnboardingSessionWithDetails } from "../db/onboardingSessions.db.server";
import { OnboardingFilterMetadataDto } from "../dtos/OnboardingFilterMetadataDto";
import OnboardingSessionUtils, { OnboardingSessionActivityDto } from "../utils/OnboardingSessionUtils";
import OnboardingBadge from "./OnboardingBadge";
import OnboardingSessionBadge from "./OnboardingSessionBadge";

export default function OnboardingSessionsTable({
  items,
  onDelete,
  metadata,
  withOnboarding = true,
}: {
  items: OnboardingSessionWithDetails[];
  onDelete?: (item: OnboardingSessionWithDetails) => void;
  metadata: OnboardingFilterMetadataDto;
  withOnboarding?: boolean;
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<OnboardingSessionWithDetails>();
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<OnboardingSessionWithDetails>[]>([]);
  const appOrAdminData = useAppOrAdminData();

  useEffect(() => {
    const headers: RowHeaderDisplayDto<OnboardingSessionWithDetails>[] = [
      {
        name: "status",
        title: t("onboarding.session.status"),
        value: (i) => <OnboardingSessionBadge item={i} />,
      },
      {
        name: "user",
        title: t("models.user.object"),
        value: (i) => (
          <div>
            <UserBadge item={i.user} />
            <TenantCell item={i.tenant} />
          </div>
        ),
      },
      // {
      //   name: "tenant",
      //   title: t("models.tenant.object"),
      //   // eslint-disable-next-line react/jsx-no-undef
      //   value: (item) => <TenantCell item={item.tenant} />,
      // },
      {
        name: "activity",
        title: t("onboarding.session.activity"),
        value: (i) => (
          <div>
            <button type="button" onClick={() => setSelected(i)} className="hover:border-theme-400 border-b border-dotted border-gray-400 hover:border-dashed">
              {OnboardingSessionUtils.getActivity({ t, item: i, metadata }).length} activities
            </button>
          </div>
        ),
      },
      {
        name: "steps",
        title: t("onboarding.session.steps"),
        value: (i) => (
          <div>
            <button type="button" onClick={() => setSelected(i)} className="hover:border-theme-400 border-b border-dotted border-gray-400 hover:border-dashed">
              {i.sessionSteps.filter((f) => f.completedAt).length}/{i.sessionSteps.length} {t("shared.completed").toLowerCase()}
            </button>
          </div>
        ),
      },
      {
        name: "actions",
        title: t("onboarding.session.actions"),
        value: (i) => <ShowPayloadModalButton title="Actions" description={`${i.actions.length} actions`} payload={JSON.stringify(i.actions)} />,
      },
      {
        name: "createdAt",
        title: t("shared.createdAt"),
        value: (i) => <div className="flex justify-center">{i.createdAt ? <DateCell date={i.createdAt} /> : <XIcon className="h-4 w-4 text-red-500" />}</div>,
      },
      {
        name: "startedAt",
        title: t("onboarding.session.startedAt"),
        value: (i) => <div className="flex justify-center">{i.startedAt ? <DateCell date={i.startedAt} /> : <XIcon className="h-4 w-4 text-red-500" />}</div>,
      },
      {
        name: "dismissedAt",
        title: t("onboarding.session.dismissedAt"),
        value: (i) => (
          <div className="flex justify-center">{i.dismissedAt ? <DateCell date={i.dismissedAt} /> : <XIcon className="h-4 w-4 text-red-500" />}</div>
        ),
      },
      {
        name: "completedAt",
        title: t("onboarding.session.completedAt"),
        value: (i) => (
          <div className="flex justify-center">{i.completedAt ? <DateCell date={i.completedAt} /> : <XIcon className="h-4 w-4 text-red-500" />}</div>
        ),
      },
    ];
    if (withOnboarding) {
      headers.unshift({
        name: "onboarding",
        title: t("onboarding.title"),
        value: (i) => (
          <div className="flex items-center space-x-2">
            <div className="text-base font-bold">{i.onboarding.title}</div>
            <div>
              <OnboardingBadge item={i.onboarding} />
            </div>
          </div>
        ),
      });
    }
    headers.push({
      name: "actions",
      title: t("shared.actions"),
      value: (i) => (
        <div className="flex items-center space-x-2">
          {onDelete && (
            <ButtonTertiary disabled={!getUserHasPermission(appOrAdminData, "admin.onboarding.delete")} destructive type="button" onClick={() => onDelete(i)}>
              {t("shared.delete")}
            </ButtonTertiary>
          )}
        </div>
      ),
    });
    setHeaders(headers);
  }, [appOrAdminData, metadata, onDelete, t, withOnboarding]);
  return (
    <>
      <SessionModal item={selected} open={selected !== undefined} onClose={() => setSelected(undefined)} metadata={metadata} />
      <TableSimple
        items={items}
        actions={
          [
            // { title: t("shared.overview"), onClickRoute: (_, i) => `${i.id}` }
          ]
        }
        headers={headers}
        noRecords={
          <div className="p-12 text-center">
            <h3 className="mt-1 text-sm font-medium text-gray-900">{t("onboarding.session.empty.title")}</h3>
            <p className="mt-1 text-sm text-gray-500">{t("onboarding.session.empty.description")}</p>
          </div>
        }
      />
    </>
  );
}

function SessionModal({
  item,
  open,
  onClose,
  metadata,
}: {
  item?: OnboardingSessionWithDetails;
  open: boolean;
  onClose: () => void;
  metadata: OnboardingFilterMetadataDto;
}) {
  const { t } = useTranslation();
  const [items, setItems] = useState<OnboardingSessionActivityDto[]>([]);
  useEffect(() => {
    if (!item) {
      return;
    }
    setItems(OnboardingSessionUtils.getActivity({ t, item, metadata }));
  }, [item, metadata, t]);
  return (
    <Modal open={open} setOpen={onClose} size="2xl">
      <div className="inline-block w-full overflow-hidden bg-white text-left align-bottom sm:align-middle">
        <div className="flex justify-between space-x-2">
          <h3 className="text-foreground text-lg font-medium leading-6">Session</h3>
          <div className="text-sm italic text-gray-500">{item?.id}</div>
        </div>
        <div className="mt-4 space-y-2">
          {" "}
          <TableSimple
            items={items}
            headers={[
              {
                name: "createdAt",
                title: "Date",
                value: (i) => <div className="text-gray-500">{DateUtils.dateYMDHMS(i.createdAt)}</div>,
              },
              {
                name: "type",
                title: "Type",
                value: (i) => i.type,
              },
              {
                name: "description",
                title: "Description",
                value: (i) => i.description,
                className: "w-full",
              },
            ]}
          />
        </div>
      </div>
    </Modal>
  );
}
