import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import XIcon from "~/components/ui/icons/XIcon";
import TableSimple from "~/components/ui/tables/TableSimple";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { EntityWithDetails, getAllEntities } from "~/utils/db/entities/entities.db.server";
import { RowTaskWithDetails } from "~/utils/db/entities/rowTasks.db.server";
import RowHelper from "~/utils/helpers/RowHelper";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import { getUserInfo } from "~/utils/session.server";
import DateUtils from "~/utils/shared/DateUtils";

type LoaderData = {
  tasks: RowTaskWithDetails[];
  allEntities: EntityWithDetails[];
};
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const tenantId = await getTenantIdOrNull({ request, params });
  const userInfo = await getUserInfo(request);

  const tasks = await RowsApi.getTasks({
    assignedOrCreatedUserId: userInfo.userId,
  });
  const data: LoaderData = {
    tasks,
    allEntities: await getAllEntities({ tenantId, active: true }),
  };
  return json(data);
};

export default () => {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  return (
    <div className="space-y-5 p-8">
      <div className="flex items-center justify-between space-x-2">
        <h3 className="flex-grow text-lg font-medium leading-6 text-gray-900">{t("models.rowTask.plural")}</h3>
      </div>
      <TableSimple
        items={data.tasks}
        headers={[
          {
            name: "row",
            title: t("models.row.object"),
            value: (i) => <TaskRow allEntities={data.allEntities} task={i} />,
          },
          {
            name: "task",
            title: t("models.rowTask.object"),
            value: (i) => <div className="w-full">{i.title}</div>,
            className: "w-full",
          },
          {
            name: "completed",
            title: t("models.rowTask.completed"),
            value: (i) => <div>{i.completed ? <CheckIcon className="h-4 w-4 text-gray-400" /> : <XIcon className="h-4 w-4 text-gray-400" />}</div>,
          },
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (item) => DateUtils.dateAgo(item.createdAt),
            className: "text-gray-400 text-xs",
            breakpoint: "sm",
            sortable: true,
          },
        ]}
      />
    </div>
  );
};

function TaskRow({ allEntities, task }: { allEntities: EntityWithDetails[]; task: RowTaskWithDetails }) {
  const { t } = useTranslation();
  const [entity] = useState(allEntities.find((f) => f.id === task.row.entityId));
  return <div>{entity && RowHelper.getTextDescription({ entity, item: task.row, t })}</div>;
}
