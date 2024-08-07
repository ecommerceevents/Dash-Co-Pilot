import { RowMedia } from "@prisma/client";
import clsx from "clsx";
import { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { FileBase64 } from "~/application/dtos/shared/FileBase64";
import PreviewMediaModal from "~/components/ui/media/PreviewMediaModal";
import HintTooltip from "~/components/ui/tooltips/HintTooltip";
import MediaItem from "~/components/ui/uploaders/MediaItem";
import UploadDocuments from "~/components/ui/uploaders/UploadDocument";
import { updateItemByIdx } from "~/utils/shared/ObjectUtils";

interface Props {
  name: string;
  title?: string;
  initialMedia?: RowMedia[] | MediaDto[] | undefined;
  disabled?: boolean;
  onSelected?: (item: MediaDto[]) => void;
  className?: string;
  readOnly?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  accept?: string;
  hint?: ReactNode;
  help?: string;
  icon?: string;
  maxSize?: number;
  uploadText?: string;
  autoFocus?: boolean;
}
export default function InputMedia({
  name,
  title,
  initialMedia,
  disabled,
  onSelected,
  className,
  readOnly,
  required,
  min,
  max,
  accept,
  hint,
  help,
  icon,
  maxSize,
  uploadText,
  autoFocus,
}: Props) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<MediaDto[]>(initialMedia ?? []);
  const [selectedItem, setSelectedItem] = useState<MediaDto>();

  useEffect(() => {
    if (onSelected) {
      onSelected(items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  function deleteMedia(idx: number) {
    setItems(items.filter((_f, index) => index !== idx));
  }

  function onDroppedFiles(e: FileBase64[]) {
    setError(undefined);
    if (max) {
      if (e.length + items.length > max) {
        setError("Maximun number of files exceeded: " + max);
        return;
      }
    }
    if (maxSize) {
      const bytesToMegaBytes = (bytes: number) => bytes / (1024 * 1024);
      const found = e.find((f) => bytesToMegaBytes(f.file.size) > maxSize);
      if (found) {
        setError(`Max size is ${maxSize} MB, found ${bytesToMegaBytes(found.file.size).toFixed(2)}`);
        return;
      }
    }
    if (accept?.includes(".")) {
      const acceptedFileExtensions = accept.split(",");
      const invalidFiles = e.map((f) => {
        let foundExtension = "";
        acceptedFileExtensions
          .filter((f) => f)
          .forEach((element) => {
            if (f.file.name.toLowerCase().endsWith(element.toLowerCase())) {
              foundExtension = element;
            }
          });
        if (!foundExtension) {
          return f;
        }
        return null;
      });
      if (invalidFiles.find((f) => f !== null)) {
        setError("Invalid file type: " + accept);
        return;
      }
    }

    const newAttachments: MediaDto[] = [...items];
    e.forEach(({ file, base64 }) => {
      newAttachments.push({
        title: file.name.split(".").slice(0, -1).join("."),
        file: base64,
        name: file.name,
        type: file.type,
        // _file: file,
      });
    });
    setItems(newAttachments);
  }

  function preview(item: MediaDto) {
    setSelectedItem(item);
  }

  function download(item: MediaDto) {
    const downloadLink = document.createElement("a");
    downloadLink.href = item.publicUrl ?? item.file;
    downloadLink.download = item.name;
    downloadLink.click();
  }

  function isDisabled() {
    return disabled || readOnly;
  }
  return (
    <div className={clsx(className, "")}>
      <label htmlFor={name} className="flex justify-between space-x-2 text-xs font-medium">
        <div className=" flex items-center space-x-1">
          <div className="truncate">
            {title && (
              <>
                {t(title)}
                {required && <span className="ml-1 text-red-500">*</span>}
              </>
            )}
          </div>
          <div className="">{help && <HintTooltip text={help} />}</div>
        </div>
        <div>{error && <span className="text-red-500">{error}</span>}</div>
        {hint}
      </label>
      <div className="mt-1">
        {/* <UploadDocuments onDropped={onDroppedFile} /> */}
        {!isDisabled() && items.length === 0 && (
          <UploadDocuments
            name={name}
            disabled={isDisabled() || (max !== undefined && max <= items.length)}
            multiple={true}
            onDroppedFiles={onDroppedFiles}
            accept={accept}
            uploadText={uploadText}
            autoFocus={autoFocus}
          />
        )}

        {isDisabled() && items.length === 0 && (
          <div>
            <div className="border-border flex h-12 w-full cursor-not-allowed items-center justify-center rounded-md border border-dashed">
              <div className="text-foreground text-xs">
                <p>{t("shared.files.noFilesUploaded")}</p>
              </div>
            </div>
          </div>
        )}

        {items.map((item, idx) => {
          return <input key={idx} type="hidden" name={name + `[]`} value={JSON.stringify(item)} />;
        })}

        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item, idx) => {
              return (
                <MediaItem
                  key={idx}
                  item={item}
                  onChangeTitle={(title) =>
                    updateItemByIdx(items, setItems, idx, {
                      title,
                      name: title + "." + item.name.split(".").slice(-1)[0],
                    })
                  }
                  onDelete={() => deleteMedia(idx)}
                  readOnly={isDisabled()}
                  onDownload={() => download(item)}
                  onPreview={item.type.includes("pdf") || item.type.includes("image") ? () => preview(item) : undefined}
                />
              );
            })}
            <div></div>
          </div>
        ) : (
          <div></div>
        )}

        {isDisabled() && items.filter((f) => f.type.includes("image")).length > 0 && (
          <div className="mt-2">
            <div className="grid gap-1  overflow-auto">
              {items
                .filter((f) => f.type.includes("image"))
                .map((item) => {
                  return (
                    <div key={item.name} className="space-y-1">
                      <label className="text-xs text-gray-500">{item.title}</label>
                      <img
                        className="border-border h-12 w-full rounded-md border border-dashed object-contain p-1 shadow-sm"
                        src={item.publicUrl ?? item.file}
                        alt={item.title}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
      {selectedItem && <PreviewMediaModal item={selectedItem} onClose={() => setSelectedItem(undefined)} onDownload={() => download(selectedItem)} />}
    </div>
  );
}
