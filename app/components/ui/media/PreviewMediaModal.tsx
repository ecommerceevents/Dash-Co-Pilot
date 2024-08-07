import { Dialog } from "@headlessui/react";
import PdfViewer from "../pdf/PdfViewer";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import ButtonSecondary from "../buttons/ButtonSecondary";
import XIcon from "../icons/XIcon";
import OpenModal from "../modals/OpenModal";
import DownloadIcon from "../icons/DownloadIcon";

interface Props {
  item: MediaDto;
  onClose: () => void;
  onDownload: () => void;
}

export default function PreviewMediaModal({ item, onClose, onDownload }: Props) {
  function isPdf() {
    return item.type.endsWith("pdf");
  }

  function isImage() {
    return item.type.includes("image");
  }

  return (
    <OpenModal onClose={onClose}>
      <div>
        {!item ? (
          <div>Undefined</div>
        ) : (
          <div className="">
            <div className="flex items-center justify-between space-x-2">
              <Dialog.Title as="h3" className="truncate text-lg font-medium leading-6 text-gray-900">
                {item.title}
              </Dialog.Title>
              <div className="flex space-x-2">
                <ButtonSecondary type="button" onClick={onDownload}>
                  <DownloadIcon className="h-4 w-4" />
                </ButtonSecondary>
                <ButtonSecondary type="button" onClick={onClose}>
                  <XIcon className="h-4 w-4" />
                </ButtonSecondary>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {isPdf() ? (
                <div>
                  <PdfViewer file={item.publicUrl ?? item.file} canDownload={false} />
                </div>
              ) : isImage() ? (
                <div>
                  <img alt={item.title} className="mx-auto h-96 object-contain" src={item.publicUrl ?? item.file} />
                </div>
              ) : (
                <div>Not PDF or Image</div>
              )}
            </div>
          </div>
        )}
      </div>
    </OpenModal>
  );
}
