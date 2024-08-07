import { useSearchParams } from "@remix-run/react";
import clsx from "clsx";
import { useState } from "react";
import ChatGptIcon from "~/components/ui/icons/ai/ChatGptIcon";
import Modal from "~/components/ui/modals/Modal";
import ChatGptSetParametersButton from "~/modules/ai/components/ChatGptSetParametersButton";
import { PageBlockDto } from "~/modules/pageBlocks/dtos/PageBlockDto";
import PageBlocksTemplateEditor from "./PageBlocksTemplateEditor";
import { PageConfiguration } from "../../dtos/PageConfiguration";
import toast from "react-hot-toast";

export default function PageBlockEditMode({
  page,
  items,
  onSetBlocks,
}: {
  page: PageConfiguration | undefined;
  items: PageBlockDto[];
  onSetBlocks: (items: PageBlockDto[]) => void;
  canExit?: boolean;
}) {
  // const [searchParams, setSearchParams] = useSearchParams();
  const [settingTemplate, setSettingTemplate] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // function isEditMode() {
  //   return searchParams.get("editMode") !== "false";
  // }
  // function toggleEditMode() {
  //   if (searchParams.get("editMode") === "false") {
  //     setSearchParams({ editMode: "true" });
  //   } else {
  //     setSearchParams({ editMode: "false" });
  //   }
  // }

  function onDownload() {
    if (items.length === 0) {
      toast.error("No blocks to download");
      return;
    }

    const jsonBlocks = JSON.stringify(items, null, "\t");
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonBlocks);
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `blocks.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    toast.success("Paste the blocks at app/modules/pageBlocks/utils/defaultPages/defaultLandingPage.ts 'const blocks: PageBlockDto[] = [...'");
  }

  function onSetTemplate() {
    setSettingTemplate(true);
  }

  function onSelectedBlocks(items: PageBlockDto[]) {
    setSettingTemplate(false);
    onSetBlocks(items);
  }

  return (
    <div>
      {/* {isEditMode() && ( */}
      <div className="bg-gray-900 p-2 text-gray-50 dark:bg-gray-50 dark:text-gray-900">
        <div className="flex justify-center space-x-2">
          <ChatGptSetParametersButton
            page={page}
            className={clsx(
              "flex items-center justify-center space-x-1 rounded-md border border-transparent px-4 py-2 text-xs font-medium shadow-sm sm:text-sm",
              "border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
            )}
            onGenerate={(info) => {
              searchParams.set("aiGenerateBlocks", encodeURIComponent(info));
              setSearchParams(searchParams);
            }}
          >
            <ChatGptIcon className="h-5 w-5" />
          </ChatGptSetParametersButton>
          <button
            type="button"
            onClick={onDownload}
            className={clsx(
              "flex items-center justify-center space-x-1 rounded-md border border-transparent px-4 py-2 text-xs font-medium shadow-sm sm:text-sm",
              "border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
            )}
          >
            <div>
              <span className="hidden sm:block">Download Blocks</span>
              <span className="sm:hidden">Download</span>
            </div>
          </button>
          <button
            type="button"
            className={clsx(
              "flex items-center justify-center space-x-1 rounded-md border border-transparent px-4 py-2 text-xs font-medium shadow-sm sm:text-sm",
              "border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
            )}
            onClick={onSetTemplate}
          >
            <div>
              <span className="hidden sm:block">Set Template</span>
              <span className="sm:hidden">Template</span>
            </div>
          </button>
        </div>
      </div>
      {/* )} */}

      <Modal open={settingTemplate} setOpen={setSettingTemplate}>
        <div>
          <PageBlocksTemplateEditor items={items} onSelected={onSelectedBlocks} />
        </div>
      </Modal>
    </div>
  );
}
