import { Ref, useImperativeHandle, useRef, useState, forwardRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Colors } from "~/application/enums/shared/Colors";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import TrashIcon from "~/components/ui/icons/TrashIcon";
import InputCheckboxInline from "~/components/ui/input/InputCheckboxInline";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { getColors } from "~/utils/shared/ColorUtils";
import { updateItemByIdx } from "~/utils/shared/ObjectUtils";

export type OptionValue = {
  id?: string | null;
  parentId?: string | null;
  order: number;
  value: string;
  name: string | null;
  color?: Colors;
  options?: OptionValue[];
};
export interface RefPropertyOptionsForm {
  set: (options: OptionValue[]) => void;
}

interface Props {
  title: string;
  onSet: (items: OptionValue[]) => void;
}

const PropertyOptionsForm = ({ title, onSet }: Props, ref: Ref<RefPropertyOptionsForm>) => {
  useImperativeHandle(ref, () => ({ set }));

  const { t } = useTranslation();

  const errorModal = useRef<RefErrorModal>(null);

  const inputOption = useRef<RefInputText>(null);

  const [withColors, setWithColors] = useState(false);
  const [withDescriptions, setWithDescriptions] = useState(false);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<OptionValue[]>([]);

  useEffect(() => {
    if (!withDescriptions) {
      setItems((items) => items.map((f) => ({ ...f, name: null })));
    }
  }, [withDescriptions]);

  useEffect(() => {
    if (!withColors) {
      setItems((items) => items.map((f) => ({ ...f, color: undefined })));
    }
  }, [withColors]);

  function set(options: OptionValue[]) {
    setItems(options);
    if (options.length === 0 && items.length === 0) {
      addOption();
    }
    setWithColors(options.some((f) => f.color));
    setWithDescriptions(options.some((f) => f.name));

    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  function save() {
    const emptyItems = items.filter((f) => !f.value || f.value.trim() === "");
    if (emptyItems.length > 0) {
      errorModal.current?.show(t("entities.errors.selectOptionCannotBeEmpty"));
      return;
    }
    onSet(items);
    close();
  }

  function addOption() {
    const maxOrder = items.length === 0 ? 1 : Math.max(...items.map((o) => o.order));
    setItems([
      ...items,
      {
        id: null,
        parentId: null,
        order: maxOrder + 1,
        value: "",
        name: null,
        color: Colors.UNDEFINED,
        options: [],
      },
    ]);

    setTimeout(() => {
      inputOption.current?.input.current?.focus();
    }, 1);
  }

  return (
    <SlideOverWideEmpty title={`Options: ${t(title)}`} open={open} onClose={() => setOpen(false)}>
      <div className="">
        <div>
          <div className="mt-3 sm:mt-5">
            <div className="mt-4 space-y-3">
              <div className="flex space-x-3">
                <InputCheckboxInline name="with-colors" title="With colors" description="" value={withColors} setValue={setWithColors} />
                <InputCheckboxInline
                  name="with-descriptions"
                  title="With descriptions"
                  description=""
                  value={withDescriptions}
                  setValue={setWithDescriptions}
                />
              </div>
              <div className="w-full">
                <div className="flex items-center justify-between space-x-2">
                  <label htmlFor="select" className="block text-sm font-medium text-gray-700">
                    Options
                  </label>
                  <div className="flex space-x-2">
                    <ButtonTertiary onClick={addOption}>
                      <div className="-mx-1 text-xs">Add option</div>
                    </ButtonTertiary>
                  </div>
                </div>
                <div className="mt-1 space-y-2 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-2">
                  {items.map((option, idx) => {
                    return (
                      <div key={option.order} className="mt-1 flex items-center space-x-1 rounded-md">
                        <InputText
                          ref={inputOption}
                          type="text"
                          title=""
                          withLabel={false}
                          name={"select-option-" + idx}
                          value={option.value}
                          placeholder="Value..."
                          setValue={(e) =>
                            updateItemByIdx(items, setItems, idx, {
                              value: e,
                            })
                          }
                          className="flex-auto"
                        />

                        {withDescriptions && (
                          <InputText
                            type="text"
                            title=""
                            withLabel={false}
                            name={"select-option-name-" + idx}
                            placeholder="Name..."
                            value={option.name ?? undefined}
                            setValue={(e) =>
                              updateItemByIdx(items, setItems, idx, {
                                name: e,
                              })
                            }
                            className="flex-auto"
                          />
                        )}

                        {withColors && (
                          <div className="w-32">
                            <InputSelector
                              name="color"
                              title={t("models.group.color")}
                              withSearch={false}
                              value={option.color ?? Colors.UNDEFINED}
                              withLabel={false}
                              setValue={(e) =>
                                updateItemByIdx(items, setItems, idx, {
                                  color: Number(e),
                                })
                              }
                              selectPlaceholder={""}
                              className="w-32"
                              options={
                                getColors().map((color) => {
                                  return {
                                    name: <ColorBadge color={color} />,
                                    value: color,
                                  };
                                }) ?? []
                              }
                            ></InputSelector>
                          </div>
                        )}

                        <ButtonSecondary disabled={items.length === 1} type="button" onClick={() => setItems([...items.filter((_, index) => index !== idx)])}>
                          <TrashIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </ButtonSecondary>
                      </div>
                    );
                  })}
                  <div className="w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-border mt-5 border-t pt-3 sm:mt-6">
          <div className="flex items-center justify-end space-x-2">
            <ButtonSecondary onClick={close}>Cancel</ButtonSecondary>
            <ButtonPrimary onClick={save}>Save</ButtonPrimary>
          </div>
        </div>
        <ErrorModal ref={errorModal} />
      </div>
    </SlideOverWideEmpty>
  );
};

export default forwardRef(PropertyOptionsForm);
