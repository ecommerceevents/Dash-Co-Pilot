import { useEffect, useRef, useState } from "react";
import InputText, { RefInputText } from "~/components/ui/input/InputText";
import StringUtils from "~/utils/shared/StringUtils";
import TableSimple from "~/components/ui/tables/TableSimple";
import { useTranslation } from "react-i18next";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import InputSelect from "~/components/ui/input/InputSelect";
import { Form } from "@remix-run/react";
import { JsonPropertyDto, JsonPropertyType, JsonPropertyTypes } from "~/modules/jsonProperties/dtos/JsonPropertyTypeDto";
import InputCheckbox from "~/components/ui/input/InputCheckbox";
import { useTypedFetcher } from "remix-typedjson";
// import {toast} from "sonner";
import toast from "react-hot-toast";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { Button } from "~/components/ui/button";
import TrashIcon from "~/components/ui/icons/TrashIcon";
import PencilIcon from "~/components/ui/icons/PencilIcon";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";

interface Props {
  item: JsonPropertyDto | null;
  // onUpdate?: (item: JsonPropertyDto) => void;
  // onAdd?: (item: JsonPropertyDto) => void;
  onClose: () => void;
}
export default function JsonPropertyForm({ item, onClose }: Props) {
  const { t } = useTranslation();
  const fetcher = useTypedFetcher<{ error?: string; success?: string }>();

  const confirmDelete = useRef<RefConfirmModal>(null);

  const [selectedOption, setSelectedOption] = useState<{ value: string; name: string } | null>();

  const [name, setName] = useState<string>(item ? item.name : "");
  const [title, setTitle] = useState<string>(item ? item.title : "");
  const [type, setType] = useState<JsonPropertyType>(item ? (item.type as any) : "string");
  const [options, setOptions] = useState<{ value: string; name: string }[]>(item?.options || []);
  const [isRequired, setIsRequired] = useState<boolean>(item ? item.required : false);

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success(fetcher.data.success);
      onClose();
    } else if (fetcher.data?.error) {
      toast.error(fetcher.data.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data]);

  const mainInput = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      mainInput.current?.input.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    if (!item) {
      if (title.includes(".")) {
        const keys = title.split(".");
        setName(StringUtils.toCamelCase(keys[keys.length - 1].toLowerCase()));
      } else {
        setName(StringUtils.toCamelCase(title.toLowerCase()));
      }
    }
  }, [item, title, type]);

  function onAccept() {
    if (item === null) {
      const form = new FormData();
      form.append("action", "properties-add");
      form.set(
        "property",
        JSON.stringify({
          name,
          title,
          type,
          required: isRequired,
          options: type === "select" || type === "multiselect" ? options : null,
        })
      );
      fetcher.submit(form, {
        method: "post",
      });
      // if (onAdd) {
      //   onAdd({
      //     name,
      //     title,
      //     type,
      //     required: isRequired,
      //     options: type === "select" || type === "multiselect" ? options : null,
      //   });
      // }
    } else {
      const form = new FormData();
      form.append("action", "properties-edit");
      form.set("name", item.name);
      form.set(
        "property",
        JSON.stringify({
          ...item,
          name,
          title,
          type,
          options: type === "select" || type === "multiselect" ? options : null,
          required: isRequired,
        })
      );
      fetcher.submit(form, {
        method: "post",
      });

      // if (onUpdate) {
      //   onUpdate({
      //     ...item,
      //     name,
      //     title,
      //     type,
      //     options: type === "select" || type === "multiselect" ? options : null,
      //     required: isRequired,
      //   });
      // }
    }
  }
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAccept();
  }

  function onDelete(item: JsonPropertyDto) {
    confirmDelete.current?.setValue(item);
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  function onDeleteConfirmed(item: JsonPropertyDto) {
    const form = new FormData();
    form.set("action", "properties-delete");
    form.set("name", item.name);
    fetcher.submit(form, {
      method: "post",
    });
  }

  return (
    <div>
      <Form onSubmit={onSubmit}>
        <div className="mb-4 space-y-2">
          <div>
            <InputText ref={mainInput} name="title" title="Title" value={title} setValue={setTitle} required />
          </div>
          <div>
            <InputText name="name" title="Name" value={name} setValue={setName} required />
          </div>
          <div>
            <InputSelect
              name="type"
              title={t("models.jsonProperty.type")}
              value={type}
              setValue={(e) => setType(e as JsonPropertyType)}
              options={JsonPropertyTypes.map((property) => ({
                name: t(`models.jsonProperty.types.${property.value}`),
                value: property.value,
              }))}
              required
            />
          </div>
          {(type === "select" || type === "multiselect") && (
            <div className="space-y-1">
              <label className="text-xs font-medium">Options</label>
              <div>
                <TableSimple
                  items={options}
                  actions={[
                    {
                      title: t("shared.edit"),
                      onClick: (_, i) => setSelectedOption(i),
                      renderTitle: (_) => <PencilIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />,
                    },
                    {
                      title: t("shared.remove"),
                      onClick: (_, i) => setOptions((prev) => prev.filter((o) => o.value !== i.value)),
                      renderTitle: (_) => <TrashIcon className="text-muted-foreground group-hover:text-foreground h-4 w-4" />,
                    },
                  ]}
                  headers={[
                    {
                      name: "name",
                      title: t("shared.name"),
                      value: (item) => item.name,
                    },
                    {
                      name: "value",
                      title: t("shared.value"),
                      className: "w-full",
                      value: (item) => item.value,
                    },
                  ]}
                />
                <div className="mt-2">
                  <Button type="button" variant="outline" onClick={() => setSelectedOption(null)}>
                    {t("shared.add")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div>
            <InputCheckbox name="required" title="Required" value={isRequired} setValue={setIsRequired} />
          </div>
        </div>

        <div className="border-border mt-3 flex justify-between border-t pt-3">
          <div>
            {item && (
              <ButtonSecondary destructive onClick={() => onDelete(item)}>
                {t("shared.delete")}
              </ButtonSecondary>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <ButtonSecondary onClick={onClose}>{t("shared.back")}</ButtonSecondary>
            <ButtonPrimary type="submit">{t("shared.accept")}</ButtonPrimary>
          </div>
        </div>
      </Form>
      <SlideOverWideEmpty
        title={selectedOption === null ? t("shared.new") : selectedOption ? t("shared.edit") : ""}
        open={selectedOption !== undefined}
        onClose={() => setSelectedOption(undefined)}
        size="sm"
      >
        {selectedOption !== undefined && (
          <PropertyOptionForm
            item={selectedOption}
            onClose={() => setSelectedOption(undefined)}
            onUpdate={(option) => {
              if (selectedOption) {
                // onChange(items.map((item) => (item === selectedProperty ? property : item)));
                setOptions(options.map((o) => (o === selectedOption ? option : o)));
              } else {
                setOptions([...options, option]);
              }
              setSelectedOption(undefined);
            }}
            onAdd={(option) => {
              setOptions([...options, option]);
              setSelectedOption(undefined);
            }}
          />
        )}
      </SlideOverWideEmpty>

      <ConfirmModal ref={confirmDelete} destructive onYes={onDeleteConfirmed} />
    </div>
  );
}

function PropertyOptionForm({
  item,
  onUpdate,
  onAdd,
  onClose,
}: {
  item: { name: string; value: string } | null;
  onUpdate: (option: { name: string; value: string }) => void;
  onAdd: (option: { name: string; value: string }) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const [name, setName] = useState<string>(item ? item.name : "");
  const [value, setValue] = useState<string>(item ? item.value : "");

  const mainInput = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      mainInput.current?.input.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    if (!item) {
      if (name.includes(".")) {
        const keys = name.split(".");
        setValue(StringUtils.toCamelCase(keys[keys.length - 1].toLowerCase()));
      } else {
        setValue(StringUtils.toCamelCase(name.toLowerCase()));
      }
    }
  }, [item, name]);

  function onAccept() {
    if (item === null) {
      onAdd({
        name,
        value,
      });
    } else {
      onUpdate({
        ...item,
        name,
        value,
      });
    }
  }
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAccept();
  }
  return (
    <Form onSubmit={onSubmit} className="space-y-2">
      <div>
        <InputText ref={mainInput} name="name" title="Name" value={name} setValue={setName} required />
      </div>
      <div>
        <InputText name="value" title="Value" value={value} setValue={setValue} required />
      </div>
      <div className="flex justify-between">
        <div>
          <ButtonSecondary onClick={onClose}>{t("shared.back")}</ButtonSecondary>
        </div>
        <ButtonPrimary type="submit">{t("shared.accept")}</ButtonPrimary>
      </div>
    </Form>
  );
}
