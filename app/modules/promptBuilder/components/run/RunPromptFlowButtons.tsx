import { useEffect, useState } from "react";
import { PromptFlowWithDetails } from "../../db/promptFlows.db.server";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import StarsIconFilled from "~/components/ui/icons/StarsIconFilled";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import RunPromptFlowForm from "./RunPromptFlowForm";
import { useNavigation, useSubmit } from "@remix-run/react";
import Dropdown from "~/components/ui/dropdowns/Dropdown";
import { Menu } from "@headlessui/react";
import clsx from "clsx";
import PromptFlowUtils from "../../utils/PromptFlowUtils";
import { RowDto } from "~/modules/rows/repositories/RowDto";

interface Props {
  idx?: string | number;
  type: "list" | "edit";
  promptFlows: PromptFlowWithDetails[];
  row?: RowDto;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  openSideModal?: boolean;
}
export default function RunPromptFlowButtons({ idx, type, promptFlows, row, disabled, className, children, openSideModal }: Props) {
  const navigation = useNavigation();
  const submit = useSubmit();

  const [items, setItems] = useState<PromptFlowWithDetails[]>([]);
  const [isSettingPromptFlowVariables, setIsSettingPromptFlowVariables] = useState<PromptFlowWithDetails | null>(null);

  useEffect(() => {
    setItems(PromptFlowUtils.getPromptFlowsOfType({ type, promptFlows, row }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, promptFlows]);

  function onRun(item: PromptFlowWithDetails) {
    if (item.inputVariables.length > 0 || openSideModal) {
      setIsSettingPromptFlowVariables(item);
    } else {
      const form = new FormData();
      form.set("action", "run-prompt-flow");
      if (idx !== undefined) {
        form.set("idx", idx.toString());
      }
      form.set("promptFlowId", item.id);
      if (row) {
        form.set("rowId", row.id.toString());
      }
      submit(form, {
        method: "post",
      });
    }
  }

  function isLoading(f: PromptFlowWithDetails) {
    return (
      navigation.state === "submitting" &&
      navigation.formData?.get("promptFlowId") === f.id &&
      (!idx || navigation.formData?.get("idx") === idx) &&
      navigation.formData?.get("rowId") === row?.id.toString()
    );
  }
  return (
    <div>
      {items.length === 0 ? null : items.length > 1 ? (
        <Dropdown
          right={false}
          disabled={disabled}
          isLoading={navigation.state === "submitting" && navigation.formData?.get("action") === "run-prompt-flow"}
          button={
            <div className={clsx(className)}>
              <StarsIconFilled className="text-theme-500 h-4 w-4" />
            </div>
          }
          options={
            <div>
              {items.map((item) => {
                return (
                  <Menu.Item key={item.id}>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRun(item);
                        }}
                        className={clsx("w-full text-left", active ? "bg-gray-100 text-gray-900" : "text-gray-700", "block px-4 py-2 text-sm")}
                      >
                        {item.actionTitle}
                      </button>
                    )}
                  </Menu.Item>
                );
              })}
            </div>
          }
        ></Dropdown>
      ) : (
        items.map((item) => {
          return (
            <ButtonSecondary
              key={item.id}
              disabled={disabled || isLoading(item)}
              className={className}
              // isLoading={isLoading(item)}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onRun(item);
              }}
            >
              {children ?? (
                <div className={clsx(className)}>
                  {type === "edit" ? <div className="text-xs">{item.actionTitle}</div> : <StarsIconFilled className="text-theme-500 h-3 w-3" />}
                </div>
              )}
            </ButtonSecondary>
          );
        })
      )}

      <div className="z-50">
        <SlideOverWideEmpty
          title={isSettingPromptFlowVariables?.actionTitle ?? "Run prompt flow"}
          className="sm:max-w-sm"
          open={!!isSettingPromptFlowVariables}
          onClose={() => setIsSettingPromptFlowVariables(null)}
        >
          {isSettingPromptFlowVariables && <RunPromptFlowForm item={isSettingPromptFlowVariables} rowId={row?.id} />}
        </SlideOverWideEmpty>
      </div>
    </div>
  );
}
