import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, useSubmit, useNavigation } from "@remix-run/react";
import CheckEmptyCircle from "~/components/ui/icons/CheckEmptyCircleIcon";
import CheckFilledCircleIcon from "~/components/ui/icons/CheckFilledCircleIcon";
import PlusIcon from "~/components/ui/icons/PlusIcon";
import TrashIcon from "~/components/ui/icons/TrashIcon";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { RowTaskWithDetails } from "~/utils/db/entities/rowTasks.db.server";

interface Props {
  items: RowTaskWithDetails[];
}

export default function RowTasks({ items }: Props) {
  const submit = useSubmit();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const isAdding = navigation.state === "submitting" && navigation.formData?.get("action") === "task-new";
  const appOrAdminData = useAppOrAdminData();

  const formRef = useRef<HTMLFormElement>(null);

  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset();
    }
  }, [isAdding]);

  function onToggleTaskCompleted(id: string) {
    const form = new FormData();
    form.set("action", "task-complete-toggle");
    form.set("task-id", id);
    submit(form, {
      method: "post",
    });
  }

  function onDeleteTask(id: string) {
    const form = new FormData();
    form.set("action", "task-delete");
    form.set("task-id", id);
    submit(form, {
      method: "post",
    });
  }

  function canDelete(item: RowTaskWithDetails) {
    return appOrAdminData.isSuperUser || (!item.completed && item.createdByUserId === appOrAdminData.user?.id);
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <h3 className="text-sm font-medium leading-3 text-gray-800">
          <div className="flex items-center space-x-1">
            <CheckFilledCircleIcon className="h-4 w-4 text-gray-400" />
            <div>
              <span className=" font-light italic"></span> {t("models.rowTask.plural")}
            </div>
          </div>
        </h3>
        {items.length > 0 && appOrAdminData.user !== undefined && (
          <div className="inline text-xs">
            <button type="button" onClick={() => setShowAddTask(true)} className="flex items-center space-x-1 text-sm text-gray-500 hover:underline">
              <PlusIcon className="h-3 w-3" />
              <div>{t("shared.addTask")}</div>
            </button>
          </div>
        )}
      </div>

      {items.length === 0 && !showAddTask && (
        <>
          {appOrAdminData.user !== undefined ? (
            <button
              type="button"
              onClick={() => setShowAddTask(true)}
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <span className="block text-xs font-normal text-gray-500">{t("shared.noTasks")}</span>
            </button>
          ) : (
            <div className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center">
              <span className="block text-xs font-normal text-gray-500">{t("shared.noTasks")}</span>
            </div>
          )}
        </>
      )}

      {items.length > 0 && (
        <ul className="rounded-lg border-2 border-dashed border-gray-300 p-2">
          {items.map((item) => {
            return (
              <li key={item.id} className="inline py-2">
                {/* <Link to={"tasks/" + item.id} className="relative inline-flex items-center rounded-md border border-gray-300 px-3 py-0.5">
                <span className="text-sm leading-5 font-medium text-gray-900">{item.title}</span>
              </Link>{" "} */}
                <div className="group flex items-center justify-between space-x-1 truncate">
                  <div className="flex flex-grow items-center space-x-1 truncate">
                    <button
                      disabled={!appOrAdminData.user}
                      type="button"
                      onClick={() => onToggleTaskCompleted(item.id)}
                      className="flex-shrink-0 text-gray-600 hover:text-gray-700 focus:outline-none"
                    >
                      {item.completed ? <CheckFilledCircleIcon className="h-5 w-5 text-teal-500" /> : <CheckEmptyCircle className="h-5 w-5" />}
                    </button>
                    <div className="truncate text-sm text-gray-600">{item.title}</div>
                  </div>
                  {canDelete(item) && (
                    <button
                      disabled={!canDelete(item) || !appOrAdminData.user}
                      type="button"
                      onClick={() => onDeleteTask(item.id)}
                      className={clsx(
                        "invisible flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none group-hover:visible",
                        !canDelete(item) && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showAddTask && (
        <Form ref={formRef} method="post">
          <input hidden readOnly name="action" value="task-new" />
          <div className={clsx("relative flex w-full rounded-md")}>
            <input
              autoFocus
              type="text"
              className={clsx("focus:border-accent-500 focus:ring-accent-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm")}
              name="task-title"
              placeholder={t("shared.newTask") + "..."}
              autoComplete="off"
              required
            />
            <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5 ">
              <kbd className="inline-flex items-center rounded border border-gray-200 bg-white px-1 font-sans text-sm font-medium text-gray-500">
                <button type="submit">
                  <PlusIcon className="h-4 w-4" />
                </button>
              </kbd>
            </div>
          </div>
        </Form>
      )}
    </div>
  );
}
