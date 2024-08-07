import clsx from "clsx";
import { Fragment } from "react";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import DownloadIcon from "~/components/ui/icons/DownloadIcon";

export default function RowMediaCell({ media, layout = "table" }: { media: MediaDto[] | undefined; layout?: string }) {
  const onDownload = (media: MediaDto) => {
    const downloadLink = document.createElement("a");
    downloadLink.href = media.publicUrl ?? media.file;
    downloadLink.download = media.name;
    downloadLink.click();
  };
  function getFileName(name: string) {
    let fileName = name;
    if (name.includes("/")) {
      fileName = name.split("/").pop() ?? name;
    }
    if (name.includes("\\")) {
      fileName = name.split("\\").pop() ?? name;
    }
    return fileName;
  }
  return (
    <Fragment>
      <div className={clsx(layout === "table" ? "flex max-h-12 items-center space-x-2 overflow-x-visible truncate" : "grid max-h-60 gap-1  overflow-auto")}>
        {media
          ?.filter((f) => f.type.includes("image"))
          .map((item) => {
            return <img key={item.name} className={clsx("object-cover", layout === "table" ? "h-10" : "")} src={item.publicUrl ?? item.file} alt={item.name} />;
          })}

        {media
          ?.filter((f) => !f.type.includes("image"))
          .map((item, idx) => {
            return (
              <button
                type="button"
                key={idx}
                onClick={() => onDownload(item)}
                className={
                  "flex items-center space-x-1 border-b border-transparent text-xs text-gray-600 hover:border-dashed hover:border-gray-300 hover:text-gray-800"
                }
              >
                <div className="font-normal">{getFileName(item.title)}</div>
                <DownloadIcon className="h-3 w-3" />
              </button>
            );
          })}
      </div>
    </Fragment>
  );
}
