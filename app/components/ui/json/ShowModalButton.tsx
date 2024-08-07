import clsx from "clsx";
import { ReactNode, useState } from "react";
import Modal from "../modals/Modal";

export default function ShowModalButton({ title, children, className = "sm:max-w-md" }: { title: ReactNode; children?: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex space-x-2">
        <button type="button" disabled={!children} onClick={() => setOpen(true)} className={clsx(!!children && "hover:underline")}>
          {title}
        </button>
      </div>

      <Modal className={className} open={open} setOpen={setOpen}>
        {children}
      </Modal>
    </>
  );
}
