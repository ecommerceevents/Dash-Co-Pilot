import clsx from "clsx";
import { marked } from "marked";
import { ReactNode, useState } from "react";
import ButtonSecondary from "../buttons/ButtonSecondary";
import Modal from "../modals/Modal";

export default function ShowHtmlModalButton({
  html,
  title,
  link,
  size,
}: {
  html: string | undefined | null;
  title: React.ReactNode;
  link?: {
    href: string;
    target?: undefined | "_blank";
    text?: ReactNode;
  };
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex space-x-2">
        <button type="button" disabled={!html} onClick={() => setOpen(true)} className={clsx(html && "underline")}>
          {title}
        </button>
      </div>

      <Modal size={size} open={open} setOpen={setOpen}>
        <div>
          <div className="flex items-center justify-between space-x-2">
            <div className="text-lg font-medium text-gray-800">{title ?? "Details"}</div>
            {link && (
              <ButtonSecondary className="group" to={link.href} target={link.target}>
                {link.text}
              </ButtonSecondary>
            )}
          </div>
          <div className="h-[calc(100vh-10rem)] overflow-y-auto">
            <div className="prose border-border mt-2 border-t pt-2">
              <div
                dangerouslySetInnerHTML={{
                  __html: marked(html ?? ""),
                }}
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
