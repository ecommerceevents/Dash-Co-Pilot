import clsx from "clsx";
import { useEffect, useState } from "react";
import { PageBlockForm } from "~/modules/pageBlocks/components/blocks/PageBlock";
import PageBlocks from "~/modules/pageBlocks/components/blocks/PageBlocks";
import { PageBlockDto } from "~/modules/pageBlocks/dtos/PageBlockDto";

interface Props {
  type: string;
  block: PageBlockDto;
}
export default function DocPageBlock({ type, block }: Props) {
  const [item, setItem] = useState<PageBlockDto>();
  const [viewMode, setViewMode] = useState<"rows" | "columns">("rows");

  useEffect(() => {
    if (block) {
      setItem(block);
    }
  }, [block]);

  function onUpdate(newState: PageBlockDto) {
    setItem(newState);
  }
  // function selectTab(tab: string) {
  //   setSelectedTab(tab);
  // }
  function toggleViewMode() {
    setViewMode(viewMode === "rows" ? "columns" : "rows");
  }
  return (
    <div className="not-prose relative sm:p-2">
      <div className="space-y-3">
        <div className="w-auto">
          {/* <TabsWithIcons
            tabs={[
              { name: `Block`, current: selectedTab === "block", onClick: () => selectTab("block") },
              // { name: `Form`, current: selectedTab === "form", onClick: () => selectTab("form") },
              { name: `JSON`, current: selectedTab === "json", onClick: () => selectTab("json") },
            ]}
          /> */}
        </div>
        <div>
          <div className={clsx("gap gap-2", viewMode === "rows" ? "grid grid-cols-1" : "grid grid-cols-2")}>
            <div className="space-y-2">
              <h4 className="text-lg font-medium text-black">Design</h4>
              <div className="border-2 border-dashed border-gray-800">
                {item && (
                  <>
                    <PageBlocks className="" items={[item]} onChange={(e) => onUpdate(e[0])} />
                  </>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <button type="button" onClick={toggleViewMode}>
                <h4 className="text-lg font-medium text-black">Editor</h4>
              </button>
              <div className="border-2 border-dashed border-gray-800 p-3">
                {item && <PageBlockForm type={type} item={item} onUpdate={onUpdate} onUpdateLayout={() => {}} />}
              </div>
            </div>

            {/* <div className="space-y-2">
              <h4 className="text-lg font-medium text-black">JSON</h4>
              <div className="overflow-hidden border-2 border-dashed border-gray-800">
                {jsonError && <p className="text-red-500">{jsonError}</p>}
                <InputText
                  value={JSON.stringify(item, null, 2)}
                  setValue={(e) => onChangeJson(e.toString())}
                  editor="monaco"
                  editorLanguage="json"
                  editorFontSize={14}
                  editorSize="lg"
                />
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
