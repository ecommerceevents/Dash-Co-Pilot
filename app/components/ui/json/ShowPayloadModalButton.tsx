import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../modals/Modal";
import clsx from "clsx";
import toast from "react-hot-toast";

export default function ShowPayloadModalButton({
  payload,
  title,
  description,
  withCopy = true,
  className,
  size = "xl",
}: {
  payload: string;
  title?: string;
  description?: React.ReactNode;
  withCopy?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  function stringifyDetails() {
    if (typeof payload === "string") {
      return payload;
    }
    try {
      return JSON.stringify(JSON.parse(payload ?? "{}"), null, "\t");
    } catch (e) {
      return JSON.stringify(payload, null, "\t");
    }
  }
  return (
    <>
      <div className="flex space-x-2">
        {payload !== null && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={clsx(className, "hover:border-theme-400 border-b border-dotted border-gray-400 hover:border-dashed")}
          >
            {/* {t("models.log.details")} */}
            {description ?? JSON.stringify(payload)}
          </button>
        )}
      </div>

      <Modal size={size} open={open} setOpen={setOpen}>
        <div className="flex justify-between space-x-2">
          <div className="text-lg font-medium text-gray-800">{title ?? "Details"}</div>
          <div>
            {withCopy && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(stringifyDetails());
                  toast.success(t("shared.copied"));
                }}
                className="bg-theme-100 text-theme-700 hover:bg-theme-200 focus:ring-theme-500 inline-flex items-center rounded-md border border-transparent px-3 py-2 text-sm font-medium leading-4 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                {t("shared.copy")}
              </button>
            )}
          </div>
        </div>
        <div className="prose mt-2 max-h-96 overflow-auto rounded-lg border-2 border-dashed border-gray-800 bg-gray-800">
          <pre>{stringifyDetails()}</pre>
        </div>
      </Modal>
    </>
  );
}
