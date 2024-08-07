import clsx from "clsx";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import ButtonTertiary from "../buttons/ButtonTertiary";
import DownloadIcon from "../icons/DownloadIcon";
import EyeIcon from "../icons/EyeIcon";
import PaperClipIcon from "../icons/PaperClipIcon";
import TrashIcon from "../icons/TrashIcon";
import CheckIcon from "../icons/CheckIcon";

interface Props {
  item: MediaDto;
  onChangeTitle: (e: string) => void;
  onDelete: () => void;
  onDownload: () => void;
  onPreview?: () => void;
  readOnly?: boolean;
}
export default function MediaItem({ item, onChangeTitle, onDelete, onDownload, onPreview, readOnly }: Props) {
  return (
    <div className={clsx("border-border w-full rounded-md border border-dashed px-2 text-xs", readOnly ? "" : "")}>
      {readOnly ? (
        <div className="flex items-center justify-between py-2 pr-4 text-sm">
          <div className="flex w-0 flex-1 items-center">
            <PaperClipIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span className="ml-2 w-0 flex-1 truncate">{item.name}</span>
          </div>
          <div className="ml-4 flex-shrink-0 space-x-2">
            <div className="flex items-center space-x-3">
              {onPreview && (
                <ButtonTertiary type="button" onClick={onPreview} className=" border-0 font-medium text-gray-500 shadow-none hover:text-gray-500">
                  <EyeIcon className="h-4 w-4 text-gray-600" />
                </ButtonTertiary>
              )}
              <ButtonTertiary type="button" onClick={onDownload} className=" border-0 font-medium text-gray-500 shadow-none hover:text-gray-500">
                <DownloadIcon className="h-4 w-4 text-gray-600" />
              </ButtonTertiary>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex select-none items-center justify-between space-x-2 py-1">
          <div className="flex flex-grow items-center space-x-2 truncate py-1">
            {/* <div className=" inline-flex h-9 w-9 flex-shrink-0 items-center justify-center truncate rounded-sm border border-gray-300 bg-gray-100">
              <span className="truncate p-1 text-xs font-medium uppercase text-gray-500">
                <div className="truncate">{item.name.substring(item.name.lastIndexOf(".") + 1)}</div>
              </span>
            </div> */}
            <CheckIcon className={clsx("h-6 w-6 flex-shrink-0 text-teal-600")} />
            <div className="truncate text-sm font-medium">{item.title}</div>
            {/* <InputText
              withLabel={false}
              title="Media"
              readOnly={readOnly}
              required
              name="media-title"
              maxLength={50}
              value={item.title}
              setValue={(e) => onChangeTitle(e.toString())}
              className="w-full rounded-sm"
            /> */}
            {/* <div className=" text-lg">.{type.split("/")[1]}</div> */}
          </div>
          <div className="flex-shrink-0">
            <ButtonTertiary disabled={readOnly} onClick={() => onDelete()} className="group p-2">
              <TrashIcon className={clsx("h-4 w-4", readOnly ? "opacity-80" : "group-hover:text-gray-900")} />
            </ButtonTertiary>
          </div>
        </div>
      )}
    </div>
  );
}
