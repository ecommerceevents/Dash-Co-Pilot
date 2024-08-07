import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import EntityIcon from "~/components/layouts/icons/EntityIcon";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import InputGroup from "~/components/ui/forms/InputGroup";
import XIcon from "~/components/ui/icons/XIcon";
import InputCheckbox from "~/components/ui/input/InputCheckbox";
import InputRadioGroup from "~/components/ui/input/InputRadioGroup";
import InputSelect from "~/components/ui/input/InputSelect";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText from "~/components/ui/input/InputText";
import CollapsibleRow from "~/components/ui/tables/CollapsibleRow";
import OnboardingStepUtils from "~/modules/onboarding/utils/OnboardingStepUtils";
import GridBlockForm from "~/modules/pageBlocks/components/blocks/shared/grid/GridBlockForm";
import StringUtils from "~/utils/shared/StringUtils";
import { saasrockOnboardingStepBlocks } from "./defaultOnboarding/saasrockOnboarding";
import {
  defaultOnboardingBlock,
  defaultOnboardingStepBlock,
  OnboardingBlockDto,
  OnboardingBlockStyle,
  OnboardingBlockStyles,
  OnboardingInputOptionDto,
  OnboardingStepBlockDto,
} from "./OnboardingBlockUtils";
import ReactSortablePkg from "react-sortablejs";
const { ReactSortable } = ReactSortablePkg;

export default function OnboardingBlockForm({ item, onUpdate }: { item?: OnboardingBlockDto; onUpdate: (item: OnboardingBlockDto) => void }) {
  const { t } = useTranslation();
  const [state, setState] = useState<OnboardingBlockDto>(item || defaultOnboardingBlock);
  useEffect(() => {
    onUpdate(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return (
    <div className="space-y-4">
      <InputGroup title="Design">
        <div className="grid grid-cols-2 gap-2">
          <InputSelector
            withSearch={false}
            className="col-span-2"
            title="Style"
            value={state.style}
            setValue={(value) => setState({ ...state, style: value as OnboardingBlockStyle })}
            options={OnboardingBlockStyles.map((f) => f)}
          />

          <InputSelector
            withSearch={false}
            title="Height"
            value={state.height}
            disabled={state.style !== "modal"}
            setValue={(value) => setState({ ...state, height: value as any })}
            options={[
              { value: "xs", name: "xs" },
              { value: "sm", name: "sm" },
              { value: "md", name: "md" },
              { value: "lg", name: "lg" },
              { value: "xl", name: "xl" },
              { value: "auto", name: "auto" },
            ]}
          />

          <InputSelector
            withSearch={false}
            title="Can be dismissed"
            value={state.canBeDismissed ? "true" : "false"}
            disabled={state.style !== "modal"}
            setValue={(value) => setState({ ...state, canBeDismissed: value === "true" })}
            options={[
              { value: "true", name: "Yes" },
              { value: "false", name: "No" },
            ]}
          />
        </div>
      </InputGroup>

      <InputGroup title="Steps" description="Steps represent actions or tutorial steps that will be shown to the user.">
        <div className="space-y-2">
          <ReactSortable className="flex flex-col space-y-2" animation={200} list={state.steps} setList={(steps) => setState({ ...state, steps })}>
            {state.steps.map((item, index) => (
              <CollapsibleRow
                draggable
                key={item.id}
                title={item.title || "Untitled step"}
                value={OnboardingStepUtils.getStepDescription(item)}
                initial={!item.title}
                onRemove={() => {
                  const steps = state.steps ?? [];
                  const index = steps.findIndex((e) => e.id === item.id);
                  if (index > -1) {
                    steps.splice(index, 1);
                    setState({ ...state, steps });
                  }
                }}
              >
                <StepForm
                  item={item}
                  onUpdate={(item) => {
                    const steps = state.steps ?? [];
                    steps[index] = item;
                    setState({ ...state, steps });
                  }}
                />
              </CollapsibleRow>
            ))}
          </ReactSortable>
          <div className="flex justify-between space-x-2">
            <ButtonTertiary
              onClick={() =>
                setState({
                  ...state,
                  steps: [
                    ...(state.steps ?? []),
                    {
                      id: Math.floor(Math.random() * 10000).toString(),
                      // ...defaultOnboardingStepBlock,
                      title: "",
                      description: "",
                      links: [],
                      gallery: [],
                      input: [],
                    },
                  ],
                })
              }
            >
              Add step
            </ButtonTertiary>
            <div>
              {state.steps.length > 0 ? (
                <ButtonTertiary
                  destructive
                  onClick={() => {
                    if (prompt("Are you sure? Type 'yes' to confirm") === "yes") setState({ ...state, steps: [] });
                  }}
                >
                  {t("shared.clear")}
                </ButtonTertiary>
              ) : (
                <ButtonTertiary onClick={() => setState({ ...state, steps: saasrockOnboardingStepBlocks })}>Load sample steps</ButtonTertiary>
              )}
            </div>
          </div>
        </div>
      </InputGroup>
    </div>
  );
}

function StepForm({ item, onUpdate }: { item: OnboardingStepBlockDto; onUpdate: (item: OnboardingStepBlockDto) => void }) {
  const [state, setState] = useState<OnboardingStepBlockDto>(item || defaultOnboardingStepBlock);
  useEffect(() => {
    onUpdate(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return (
    <div className="grid grid-cols-1 gap-4 p-2">
      <InputText title="Title" value={state.title} setValue={(e) => setState({ ...state, title: e?.toString() })} required />
      <InputText
        title="Description"
        value={state.description}
        setValue={(e) => setState({ ...state, description: e?.toString() })}
        rows={5}
        hint="Markdown supported"
      />
      <InputText
        title="Icon"
        value={state.icon}
        setValue={(e) => setState({ ...state, icon: e?.toString() })}
        hint={<div className="text-gray-400">SVG or image URL sidebar icon</div>}
        button={
          <div className="absolute inset-y-0 right-0 flex py-0.5 pr-0.5 ">
            <kbd className="inline-flex w-10 items-center justify-center rounded border border-gray-300 bg-gray-50 px-1 text-center font-sans text-xs font-medium text-gray-500">
              {state.icon ? <EntityIcon className="h-7 w-7 text-gray-600" icon={state.icon} title={state.title} /> : <span className="text-red-600">?</span>}
            </kbd>
          </div>
        }
      />

      <InputGroup title="Links">
        <div className="flex flex-col space-y-2">
          {state.links.map((link, index) => (
            <div key={index} className="group relative grid grid-cols-4 gap-2">
              <button
                onClick={() => {
                  const links = state.links;
                  links.splice(index, 1);
                  setState({ ...state, links });
                }}
                type="button"
                className="absolute right-0 top-0 -mt-3 hidden origin-top-right justify-center rounded-full bg-white text-gray-600 hover:text-red-500 group-hover:flex"
              >
                <XIcon className="h-6 w-6" />
              </button>
              <InputText
                title="Link"
                value={link.text}
                setValue={(e) => setState({ ...state, links: state.links.map((step, i) => (i === index ? { ...step, text: e.toString() } : step)) })}
              />
              <InputText
                title="Href"
                value={link.href}
                setValue={(e) => setState({ ...state, links: state.links.map((step, i) => (i === index ? { ...step, href: e.toString() } : step)) })}
              />
              <InputCheckbox
                title="Is primary"
                value={link.isPrimary}
                setValue={(e) => setState({ ...state, links: state.links.map((link, i) => (i === index ? { ...link, isPrimary: Boolean(e) } : link)) })}
              />
              <InputCheckbox
                title="target=_blank"
                value={link.target === "_blank"}
                setValue={(e) => setState({ ...state, links: state.links.map((link, i) => (i === index ? { ...link, target: e ? "_blank" : "" } : link)) })}
              />
            </div>
          ))}
          <ButtonTertiary onClick={() => setState({ ...state, links: [...state.links, { text: "Link", href: "#", isPrimary: false }] })}>
            Add link
          </ButtonTertiary>
        </div>
      </InputGroup>

      <InputGroup title="Gallery">
        <div className="flex flex-col space-y-2">
          <ReactSortable className="flex flex-col space-y-2" animation={200} list={state.gallery} setList={(gallery) => setState({ ...state, gallery })}>
            {state.gallery.map((item, index) => (
              <CollapsibleRow
                key={index}
                title={item.title || "Untitled gallery item"}
                value={item.title || "Untitled gallery item"}
                initial={!item.title}
                onRemove={() => {
                  const gallery = state.gallery ?? [];
                  gallery.splice(index, 1);
                  setState({ ...state, gallery });
                }}
              >
                <div className="grid grid-cols-1 gap-2">
                  <InputRadioGroup
                    title="Type"
                    value={item.type}
                    setValue={(e) =>
                      setState({
                        ...state,
                        gallery: state.gallery.map((item, i) => (i === index ? { ...item, type: e?.toString() as "image" | "video" } : item)),
                      })
                    }
                    options={[
                      { name: "Image", value: "image" },
                      { name: "Video", value: "video" },
                    ]}
                  />
                  <InputText
                    title="Title"
                    type="text"
                    value={item.title}
                    setValue={(e) => setState({ ...state, gallery: state.gallery.map((item, i) => (i === index ? { ...item, title: e.toString() } : item)) })}
                  />
                  <InputText
                    title="Src"
                    type="text"
                    value={item.src}
                    setValue={(e) => setState({ ...state, gallery: state.gallery.map((item, i) => (i === index ? { ...item, src: e.toString() } : item)) })}
                  />
                </div>
              </CollapsibleRow>
            ))}
          </ReactSortable>
          <ButtonTertiary
            onClick={() =>
              setState({
                ...state,
                gallery: [
                  ...(state.gallery ?? []),
                  {
                    id: Math.floor(Math.random() * 10000).toString(),
                    type: "image",
                    title: "Item " + state.gallery.length + 1,
                    src: "",
                  },
                ],
              })
            }
          >
            Add gallery item
          </ButtonTertiary>
        </div>
      </InputGroup>

      <InputGroup title="Input">
        <div className="flex flex-col space-y-2">
          <GridBlockForm item={state.inputGrid} onUpdate={(item) => setState({ ...state, inputGrid: item })} />
          <ReactSortable className="flex flex-col space-y-2" animation={200} list={state.input} setList={(input) => setState({ ...state, input })}>
            {state.input.map((item, index) => (
              <CollapsibleRow
                key={index}
                title={item.title || "Untitled input"}
                value={item.title || "Untitled input"}
                initial={!item.title}
                onRemove={() => {
                  const input = state.input ?? [];
                  input.splice(index, 1);
                  setState({ ...state, input });
                }}
              >
                <div className="grid grid-cols-3 gap-2">
                  <InputText
                    title="Title"
                    type="text"
                    value={item.title}
                    setValue={(e) =>
                      setState({
                        ...state,
                        input: state.input.map((item, i) =>
                          i === index ? { ...item, title: e.toString(), name: StringUtils.toCamelCase(e?.toString().toLowerCase()) } : item
                        ),
                      })
                    }
                  />
                  <InputText
                    title="name"
                    type="text"
                    value={item.name}
                    setValue={(e) => setState({ ...state, input: state.input.map((item, i) => (i === index ? { ...item, name: e.toString() } : item)) })}
                  />
                  <InputCheckbox
                    title="Is required"
                    value={item.isRequired}
                    setValue={(e) => setState({ ...state, input: state.input.map((item, i) => (i === index ? { ...item, isRequired: Boolean(e) } : item)) })}
                  />

                  <InputSelect
                    className="col-span-3"
                    title="Type"
                    value={item.type}
                    setValue={(e) =>
                      setState({
                        ...state,
                        input: state.input.map((item, i) => (i === index ? { ...item, type: e?.toString() as "text" | "select" } : item)),
                      })
                    }
                    options={[
                      { name: "Text", value: "text" },
                      { name: "Select", value: "select" },
                    ]}
                  />
                  {item.type === "select" && (
                    <div className="col-span-3">
                      <SelectOptionsForm
                        options={item.options}
                        setOptions={(options) => setState({ ...state, input: state.input.map((item, i) => (i === index ? { ...item, options } : item)) })}
                      />
                    </div>
                  )}
                </div>
              </CollapsibleRow>
            ))}
          </ReactSortable>
          <ButtonTertiary
            onClick={() =>
              setState({
                ...state,
                input: [
                  ...(state.input ?? []),
                  {
                    id: Math.floor(Math.random() * 10000).toString(),
                    type: "text",
                    name: "",
                    title: "",
                    isRequired: false,
                    options: [],
                  },
                ],
              })
            }
          >
            Add input
          </ButtonTertiary>
        </div>
      </InputGroup>
    </div>
  );
}

function SelectOptionsForm({ options, setOptions }: { options: OnboardingInputOptionDto[]; setOptions: (options: OnboardingInputOptionDto[]) => void }) {
  const [state, setState] = useState<OnboardingInputOptionDto[]>(options ?? []);

  useEffect(() => {
    setOptions(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="flex flex-col space-y-2">
      {options.map((option, index) => (
        <div key={index} className="group relative grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              const options = state ?? [];
              options.splice(index, 1);
              setState(options);
            }}
            type="button"
            className="absolute right-0 top-0 -mt-3 hidden origin-top-right justify-center rounded-full bg-white text-gray-600 hover:text-red-500 group-hover:flex"
          >
            <XIcon className="h-6 w-6" />
          </button>
          <InputText
            title="Title"
            value={option.name}
            setValue={(e) =>
              setState(
                options.map((option, i) =>
                  i === index ? { ...option, name: e.toString(), value: StringUtils.toCamelCase(e?.toString().toLowerCase()) } : option
                )
              )
            }
          />
          <InputText
            title="Value"
            value={option.value}
            setValue={(e) => setState(options.map((option, i) => (i === index ? { ...option, value: e.toString() } : option)))}
          />
        </div>
      ))}
      <ButtonTertiary onClick={() => setState([...options, { value: "", name: "" }])}>Add option</ButtonTertiary>
    </div>
  );
}
