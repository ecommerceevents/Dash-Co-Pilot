import { Fragment, useState } from "react";
import { useRootData } from "~/utils/data/useRootData";
import clsx from "clsx";
import PageBlockUtils from "~/modules/pageBlocks/components/blocks/PageBlockUtils";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import DownArrow from "~/components/ui/icons/DownArrow";
import PencilIcon from "~/components/ui/icons/PencilIcon";
import PlusIcon from "~/components/ui/icons/PlusIcon";
import TrashEmptyIcon from "~/components/ui/icons/TrashEmptyIcon";
import UpArrow from "~/components/ui/icons/UpArrow";
import Modal from "~/components/ui/modals/Modal";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { PageBlock, PageBlockForm } from "./PageBlock";
import { useTranslation } from "react-i18next";
import LayoutBlockUtils from "./shared/layout/LayoutBlockUtils";
import { PageBlockDto } from "../../dtos/PageBlockDto";
import PageBlockEditMode from "./PageBlockEditMode";
import ChatGptGeneratePageBlock from "~/modules/ai/components/ChatGptGeneratePageBlock";
import { PageConfiguration } from "../../dtos/PageConfiguration";

export default function PageBlocks({
  page,
  items,
  editor,
  onChange,
  className = "overflow-hidden",
}: {
  page?: PageConfiguration;
  items: PageBlockDto[];
  editor?: { add?: boolean; edit?: boolean; remove?: boolean; move?: boolean; download?: boolean; ai?: boolean };
  onChange?: (items: PageBlockDto[]) => void;
  className?: string;
}) {
  const { userSession } = useRootData();
  const [editingBlockIndex, setEditingBlockIndex] = useState(-1);
  const [editingBlock, setEditingBlock] = useState<PageBlockDto>();
  const [editinBlockType, setEditingBlockType] = useState<string>("");

  const [blocksLoading, setBlocksLoading] = useState<number[]>([]);

  function onRemove(block: PageBlockDto) {
    if (onChange) {
      onChange(items.filter((b) => b !== block));
    }
  }
  function onEdit(block: PageBlockDto, index: number) {
    setEditingBlock(block);
    setEditingBlockType(getType(block));
    setEditingBlockIndex(index);
  }
  function onMoveUp(block: PageBlockDto) {
    const index = items.indexOf(block);
    if (index > 0) {
      const newBlocks = [...items];
      newBlocks[index] = newBlocks[index - 1];
      newBlocks[index - 1] = block;
      if (onChange) {
        onChange(newBlocks);
      }
    }
  }
  function onMoveDown(block: PageBlockDto) {
    const index = items.indexOf(block);
    if (index < items.length - 1) {
      const newBlocks = [...items];
      newBlocks[index] = newBlocks[index + 1];
      newBlocks[index + 1] = block;
      if (onChange) {
        onChange(newBlocks);
      }
    }
  }
  function onUpdateEditingBlock(newState: PageBlockDto) {
    if (onChange) {
      onChange(
        items.map((b, i) => {
          if (i === editingBlockIndex) {
            return { ...b, ...newState };
          }
          return b;
        })
      );
    }
  }
  function onUpdateLayout(layout?: PageBlockDto["layout"]) {
    if (onChange) {
      onChange(
        items.map((b, i) => {
          if (i === editingBlockIndex) {
            return { ...b, layout };
          }
          return b;
        })
      );
    }
  }
  function addBlock(type: string, index?: number) {
    if (!PageBlockUtils.defaultBlocks.hasOwnProperty(type)) {
      alert("[UNDER CONSTRUCTION 🚧] Block form: " + type);
      return;
    }
    // @ts-ignore
    const newBlock = { [type]: PageBlockUtils.defaultBlocks[type] };
    if (index === undefined) {
      if (onChange) {
        onChange([...items, newBlock]);
      }
    } else {
      if (onChange) {
        onChange([...items.slice(0, index), newBlock, ...items.slice(index)]);
      }
    }
  }

  function getType(item: PageBlockDto) {
    const keys = Object.keys(item);
    if (keys.length === 0) {
      throw new Error("Invalid block type");
    }
    return keys[0];
  }

  function isGeneratingAnyBlock() {
    return blocksLoading.length > 0;
  }

  function isGeneratingBlock(index: number) {
    return blocksLoading.includes(index);
  }

  function onGenerated(index: number, block: PageBlockDto) {
    const newBlocks = [...items];
    newBlocks[index] = block;
    if (onChange) {
      onChange(newBlocks);
    }
  }

  return (
    <Fragment>
      {editor?.download && <PageBlockEditMode page={page} items={items} onSetBlocks={(e) => onChange && onChange(e)} />}
      <div className={clsx("relative", className, editor && "")}>
        {/* {editMode && items.length > 0 && <AddBlockButton className={"py-8"} onAdd={(type) => addBlock(type, 0)} />} */}

        {items?.map((item, idx) => {
          return (
            <Fragment key={idx}>
              <div className={clsx("group relative", item.header && "z-10")}>
                {/* {editMode && idx === 0 && <AddBlockButton onAdd={(type) => addBlock(type, 0)} />} */}

                {editor && (
                  <div
                    className={clsx(
                      "border-theme-500 bg-theme-50 sticky top-0 z-10 w-full border-2 border-dashed p-2 px-2 py-2 opacity-90 shadow-inner",
                      item.banner ? "flex" : "hidden group-hover:flex"
                    )}
                  >
                    <div className="mx-auto flex w-full max-w-md items-center justify-between">
                      <div className="text-lg font-extrabold capitalize text-gray-900">{getType(item)}</div>
                      <div className="flex items-center space-x-1">
                        {editor.remove && (
                          <ButtonSecondary disabled={isGeneratingAnyBlock()} destructive onClick={() => onRemove(item)}>
                            <TrashEmptyIcon className="h-4 w-4" />
                          </ButtonSecondary>
                        )}
                        {editor.edit && (
                          <ButtonSecondary disabled={isGeneratingAnyBlock()} onClick={() => onEdit(item, idx)}>
                            <PencilIcon className="h-4 w-4" />
                          </ButtonSecondary>
                        )}
                        {editor.remove && (
                          <>
                            <ButtonSecondary disabled={isGeneratingAnyBlock()} onClick={() => onMoveUp(item)}>
                              <UpArrow className="h-4 w-4" />
                            </ButtonSecondary>
                            <ButtonSecondary disabled={isGeneratingAnyBlock()} onClick={() => onMoveDown(item)}>
                              <DownArrow className="h-4 w-4" />
                            </ButtonSecondary>
                          </>
                        )}
                        {editor.ai && (
                          <ChatGptGeneratePageBlock
                            page={page}
                            block={item}
                            onGenerated={(newBlock) => onGenerated(idx, newBlock)}
                            onLoading={(isLoading) => {
                              // console.log("onLoading", isLoading, idx);
                              if (isLoading) {
                                setBlocksLoading([...blocksLoading, idx]);
                              } else {
                                setBlocksLoading(blocksLoading.filter((i) => i !== idx));
                              }
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {editor?.add && (
                  <AddBlockButton
                    disabled={isGeneratingAnyBlock()}
                    className={clsx("absolute top-0 z-10 -mt-4 hidden w-full group-hover:block")}
                    onAdd={(type) => addBlock(type, idx)}
                  />
                )}
                <div
                  className={clsx(
                    editor && "rounded-md rounded-t-none border-2 border-b-0 border-t-0 border-dashed border-transparent group-hover:border-gray-800",
                    LayoutBlockUtils.getClasses(item),
                    isGeneratingBlock(idx) && "opacity-50"
                  )}
                >
                  <PageBlock item={item} userSession={userSession} />
                </div>

                {editor?.add && idx !== items.length - 1 && (
                  <AddBlockButton
                    disabled={isGeneratingAnyBlock()}
                    className={clsx("absolute bottom-0 z-10 -mb-4 hidden w-full group-hover:block", items.length === 0 && "py-8")}
                    onAdd={(type) => addBlock(type, idx + 1)}
                  />
                )}
              </div>
            </Fragment>
          );
        })}

        {editor?.add && <AddBlockButton className={clsx(items.length === 0 && "py-8")} onAdd={(type) => addBlock(type)} />}
        <SlideOverWideEmpty
          title={editingBlock ? getType(editingBlock).toLowerCase() : ""}
          open={editingBlock !== undefined}
          onClose={() => setEditingBlock(undefined)}
        >
          {editingBlock && <PageBlockForm type={editinBlockType} item={editingBlock} onUpdate={onUpdateEditingBlock} onUpdateLayout={onUpdateLayout} />}
        </SlideOverWideEmpty>
      </div>
    </Fragment>
  );
}

function AddBlockButton({ onAdd, className, disabled }: { onAdd: (type: string) => void; className?: string; disabled?: boolean }) {
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);

  return (
    <div className={className}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="border-theme-300 dark:border-theme-800 w-full border-t" />
        </div>
        <div className="relative flex justify-center">
          <button
            disabled={disabled}
            onClick={() => setAdding(true)}
            type="button"
            className={clsx(
              "border-theme-300 bg-theme-50 hover:bg-theme-100 focus:ring-theme-500 dark:border-theme-800 dark:bg-theme-900 inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium leading-5 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <PlusIcon className="text-theme-400 dark:text-theme-600 h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Modal open={adding} setOpen={setAdding}>
        <div className="space-y-3 text-gray-800">
          <div className="flex justify-between">
            <div className="text-xl font-extrabold">{t("pages.blocks")}</div>
          </div>
          <div className="">
            <div className="grid grid-cols-4 gap-3">
              {Object.keys(PageBlockUtils.defaultBlocks).map((type) => {
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      onAdd(type);
                      setAdding(false);
                    }}
                    className="group flex w-full flex-col items-center space-y-2 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-2 hover:border-gray-800 hover:bg-gray-100 focus:border-transparent focus:bg-gray-100 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800"
                  >
                    {/* <PlusIcon className="h-3 w-3 text-gray-500 group-hover:text-gray-800" /> */}
                    <div className="capitalize">{type}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
