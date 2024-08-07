import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "~/components/ui/modals/Modal";
import { LogWithDetails } from "~/utils/db/logs.db.server";

export default function LogDetailsButton({ item }: { item: LogWithDetails }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  function stringifyDetails() {
    try {
      return JSON.stringify(JSON.parse(item.details?.toString() ?? "{}"), null, "\t");
    } catch (e) {
      return item.details;
    }
  }
  return (
    <>
      <div className="flex space-x-2">
        {item.details !== null && (
          <button type="button" onClick={() => setOpen(true)} className="italic underline hover:text-gray-800">
            {t("models.log.details")}
          </button>
        )}
      </div>

      <Modal className="sm:max-w-md" open={open} setOpen={setOpen}>
        <div className="flex justify-between space-x-2">
          <div className="text-lg font-medium text-gray-800">Details</div>
          <div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(item.details ?? "");
              }}
              className="inline-flex items-center rounded-md border border-transparent bg-theme-100 px-3 py-2 text-sm font-medium leading-4 text-theme-700 hover:bg-theme-200 focus:outline-none focus:ring-2 focus:ring-theme-500 focus:ring-offset-2"
            >
              {t("shared.copy")}
            </button>
          </div>
        </div>
        <div className="prose mt-2 rounded-lg border-2 border-dashed border-gray-800 bg-gray-800">
          <pre>{stringifyDetails()}</pre>
        </div>
      </Modal>
    </>
  );
}
