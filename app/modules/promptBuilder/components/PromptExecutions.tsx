import InputText from "~/components/ui/input/InputText";
import DateUtils from "~/utils/shared/DateUtils";
import { PromptFlowWithExecutions } from "../db/promptFlows.db.server";
import { useTranslation } from "react-i18next";
import InputSelect from "~/components/ui/input/InputSelect";
import PromptResultBadge from "./PromptResultBadge";
import { useState } from "react";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import TableSimple from "~/components/ui/tables/TableSimple";
import DateCell from "~/components/ui/dates/DateCell";
import UserBadge from "~/components/core/users/UserBadge";
import TenantBadge from "~/components/core/tenants/TenantBadge";
import { Link, useNavigation } from "@remix-run/react";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import { OpenAIDefaults } from "~/modules/ai/utils/OpenAIDefaults";

interface Props {
  item: PromptFlowWithExecutions;
  onDelete?: (id: string) => void;
}
export default function PromptExecutions({ item, onDelete }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [opened, setOpened] = useState<number[]>([0]);

  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-3 gap-2">
        <InputText name="createdAt" title="Created at" defaultValue={DateUtils.dateYMDHMS(item.createdAt)} disabled />
        <InputText autoFocus name="title" title={t("shared.title")} defaultValue={item.title} disabled />
        <InputText name="description" title={t("shared.description")} defaultValue={item.description} disabled />
        <InputText name="actionTitle" title={"Action title"} defaultValue={item.actionTitle ?? ""} disabled />
        <InputSelect
          name="executionType"
          title={"Execution type"}
          value={item.executionType}
          options={[
            {
              name: "Sequential",
              value: "sequential",
            },
            {
              name: "Parallel",
              value: "parallel",
            },
          ]}
          disabled
        />
        <InputSelect name="model" title={"Model"} value={item.model} options={OpenAIDefaults.models.map((f) => f)} disabled />
      </div>

      <div className="flex items-center justify-between space-x-2">
        <h3 className="text-sm font-bold">Executions</h3>

        <div>
          <ButtonTertiary
            onClick={() => {
              if (opened.length === item.executions.length) {
                setOpened([]);
                return;
              } else {
                setOpened(item.executions.map((_, idx) => idx));
              }
            }}
          >
            {opened.length === item.executions.length ? "Collapse all" : "Expand all"}
          </ButtonTertiary>
        </div>
      </div>

      {item.executions.length === 0 ? (
        <EmptyState
          captions={{
            thereAreNo: "There are no executions",
          }}
        />
      ) : (
        <TableSimple
          items={item.executions}
          actions={[
            {
              title: "Delete",
              onClick: (_idx, i) => (onDelete ? onDelete(i.id) : undefined),
              destructive: true,
              disabled: (i) => navigation.state === "submitting" && navigation.formData?.get("id") === i.id,
            },
          ]}
          headers={[
            {
              name: "status",
              title: "Status",
              value: (i) => <PromptResultBadge createdAt={i.createdAt} startedAt={i.startedAt} completedAt={i.completedAt} status={i.status} error={i.error} />,
            },
            {
              name: "createdAt",
              title: "Created at",
              value: (i) => <DateCell date={i.createdAt} />,
            },
            {
              name: "user",
              title: "User",
              value: (i) => (i.user ? <UserBadge item={i.user} /> : "?"),
            },
            {
              name: "tenant",
              title: "Account",
              value: (i) => (i.tenant ? <TenantBadge item={i.tenant} /> : <span className="italic text-gray-600">Admin</span>),
            },
            {
              name: "duration",
              title: "Duration",
              value: (i) => DateUtils.getDurationInSeconds({ start: i.startedAt, end: i.completedAt }),
            },
            {
              name: "startedAt",
              title: "Started at",
              value: (i) => <DateCell date={i.startedAt} />,
            },
            {
              name: "completedAt",
              title: "Completed at",
              value: (i) => <DateCell date={i.completedAt} />,
            },
            {
              name: "results",
              title: "Results",
              value: (i) => (
                <Link to={`/admin/prompts/executions/${i.id}/results`} className="flex flex-col underline">
                  <div>
                    {i.results.length} {i.results.length === 1 ? "result" : "results"}
                  </div>
                </Link>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
