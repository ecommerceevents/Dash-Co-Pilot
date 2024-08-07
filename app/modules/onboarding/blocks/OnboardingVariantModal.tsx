import clsx from "clsx";
import { marked } from "marked";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import CustomCarousel from "~/components/ui/images/CustomCarousel";
import InputSelect from "~/components/ui/input/InputSelect";
import InputText from "~/components/ui/input/InputText";
import Modal from "~/components/ui/modals/Modal";
import Tabs from "~/components/ui/tabs/Tabs";
import GridBlockUtils from "~/modules/pageBlocks/components/blocks/shared/grid/GridBlockUtils";
import { OnboardingBlockDto, OnboardingStepBlockDto } from "./OnboardingBlockUtils";

export default function OnboardingVariantModal({
  block,
  currentStepIdx,
  setStep,
  open,
  onClose,
  onDismiss,
  onComplete,
  onLinkClick,
  onUpdateCurrentStepState,
}: {
  block: OnboardingBlockDto;
  currentStepIdx: number;
  open: boolean;
  setStep: (idx: number) => void;
  onClose: () => void;
  onDismiss: () => void;
  onComplete: () => void;
  onLinkClick: (item: { text: string; href: string }) => void;
  onUpdateCurrentStepState: (state: { [key: string]: string }) => void;
}) {
  const { t } = useTranslation();
  function dismiss() {
    onDismiss();
  }
  function onNext() {
    const nextStep = block.steps[currentStepIdx + 1];
    if (nextStep) {
      setStep(currentStepIdx + 1);
    } else {
      onComplete();
    }
  }
  return (
    <Modal
      open={open}
      setOpen={() => {
        if (block.canBeDismissed) {
          onClose();
        }
      }}
      padding="none"
    >
      <div>
        <div className="flex items-center justify-between space-x-2 border-b border-gray-300 px-2 py-2">
          <div className="truncate text-lg font-bold">{t(block.title)}</div>
          <div className="hidden items-center space-x-1 sm:flex">
            {block.steps.map((step, idx) => {
              return (
                <button
                  key={idx}
                  onClick={() => setStep(idx)}
                  className={clsx(
                    "w-full focus:outline-none",
                    step.completedAt
                      ? "text-teal-500 hover:text-teal-600"
                      : idx === currentStepIdx
                      ? "text-teal-600 hover:text-teal-700"
                      : "text-gray-300 hover:text-gray-400"
                  )}
                >
                  <svg
                    className={clsx("h-4 w-4")}
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                  >
                    {" "}
                    <path d="M 41 42 L 9 42 C 5.132813 42 2 38.867188 2 35 L 2 15 C 2 11.132813 5.132813 8 9 8 L 41 8 C 44.867188 8 48 11.132813 48 15 L 48 35 C 48 38.867188 44.867188 42 41 42 Z"></path>{" "}
                  </svg>
                </button>
              );
            })}
          </div>
          <Tabs
            className="sm:hidden"
            onSelected={(e) => setStep(e)}
            tabs={block.steps.map((step) => {
              return { name: step.title };
            })}
          />
        </div>
        <div
          className={clsx(
            "bg-gray-50",
            block.height === "xs" && "h-20",
            block.height === "sm" && "h-40",
            block.height === "md" && "h-60",
            block.height === "lg" && "h-80",
            block.height === "xl" && "h-96",
            block.height === "auto" && "h-auto",
            block.height !== "auto" && "overflow-y-auto"
          )}
        >
          <div className="relative flex h-full">
            {block.steps.length > 0 && (
              <div className="hidden w-1/2 divide-y-2 divide-gray-200 overflow-y-scroll bg-gray-100 sm:block">
                {block.steps.map((step, idx) => {
                  return (
                    <Fragment key={idx}>
                      <button
                        type="button"
                        className={clsx(
                          "w-full truncate px-3 py-3 text-left text-base font-medium focus:outline-none",
                          idx === currentStepIdx ? "bg-white text-gray-800" : "border-r-2 border-gray-200 text-gray-500"
                        )}
                        onClick={() => setStep(idx)}
                      >
                        <div className="flex items-center space-x-2">
                          {step.icon && (
                            <>
                              {step.icon.startsWith("<svg") ? (
                                <div dangerouslySetInnerHTML={{ __html: step.icon.replace("<svg", `<svg class='${"h-5 w-5"}'`) ?? "" }} />
                              ) : step.icon.startsWith("http") ? (
                                <img className="h-5 w-5" src={step.icon} alt={step.title} />
                              ) : (
                                <div className="w-5">{step.icon}</div>
                              )}
                            </>
                          )}
                          <div>{t(step.title)}</div>
                        </div>
                      </button>
                    </Fragment>
                  );
                })}
                <div className="h-full border-r-2 border-gray-200 p-2"></div>
              </div>
            )}
            {block.steps.length > 0 && (
              <div className={clsx("w-full overflow-y-auto bg-white px-4 pb-4")}>
                {block.steps.length > currentStepIdx && (
                  <OnboardingStep step={block.steps[currentStepIdx]} onLinkClick={onLinkClick} onUpdate={onUpdateCurrentStepState} />
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between space-x-2 border-t border-gray-300 bg-gray-50 px-2 py-2">
          <div className="flex items-center space-x-2 truncate px-2 py-2">
            <ButtonSecondary type="button" disabled={currentStepIdx === 0} onClick={() => setStep(currentStepIdx - 1)} className="sm:hidden">
              {t("shared.back")}
            </ButtonSecondary>
            {block.canBeDismissed && (
              <button type="button" className="rounded-md px-2 py-2 text-xs text-gray-500 hover:underline focus:underline focus:outline-none" onClick={dismiss}>
                {t("shared.dontShowThisAgain")}
              </button>
            )}
          </div>
          <div className="flex items-center justify-end space-x-2 truncate px-2 py-2">
            <ButtonSecondary type="button" disabled={currentStepIdx === 0} onClick={() => setStep(currentStepIdx - 1)} className="hidden sm:block">
              {t("shared.back")}
            </ButtonSecondary>
            <ButtonSecondary
              disabled={block.steps.length === currentStepIdx + 1}
              type="button"
              onClick={onNext}
              className={clsx(block.steps.length === currentStepIdx + 1 && "hidden sm:block")}
            >
              {t("shared.next")}
            </ButtonSecondary>
            <ButtonPrimary
              disabled={block.steps.length !== currentStepIdx + 1}
              type="button"
              onClick={onComplete}
              className={clsx(block.steps.length !== currentStepIdx + 1 && "hidden sm:block")}
            >
              {t("shared.complete")}
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function OnboardingStep({
  step,
  onLinkClick,
  onUpdate,
}: {
  step: OnboardingStepBlockDto;
  onLinkClick: (link: { text: string; href: string }) => void;
  onUpdate: (state: { [key: string]: string }) => void;
}) {
  const { t } = useTranslation();
  const [state, setState] = useState<{ [key: string]: string }>({});
  useEffect(() => {
    if (onUpdate) {
      onUpdate(state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return (
    <div className="space-y-2">
      {step.description && (
        <div className="prose">
          <div
            dangerouslySetInnerHTML={{
              __html: marked(step.description),
            }}
          />
        </div>
      )}
      {step.links && step.links.length > 0 && (
        <div className="-mx-0.5 flex flex-wrap items-center">
          {step.links.map((link, idx) => {
            return (
              <div key={idx} className="p-0.5">
                <button
                  type="button"
                  onClick={() => onLinkClick(link)}
                  className={clsx(
                    "rounded-md px-2 py-1 text-sm",
                    link.isPrimary ? "bg-theme-700 text-white" : "border border-gray-300 bg-gray-100 text-gray-800"
                  )}
                >
                  {t(link.text)}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {step.gallery && step.gallery.length > 0 && (
        <div className="flex flex-col justify-center space-y-2">
          <CustomCarousel items={step.gallery} />
          {/* {step.gallery.map((galleryItem, idx) => {
            return (
              <Fragment key={idx}>
                {galleryItem.type === "image" && (
                  <img
                    alt={galleryItem.title && t(galleryItem.title)}
                    className="rounded-md border border-dashed border-gray-500 object-cover shadow-md"
                    src={galleryItem.src}
                  />
                )}
                {galleryItem.type === "video" && (
                  <iframe
                    src={galleryItem?.src}
                    title={galleryItem?.title ?? ""}
                    frameBorder="0"
                    loading="lazy"
                    className="rounded-md border border-dashed border-gray-500 object-cover shadow-md"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  ></iframe>
                )}
              </Fragment>
            );
          })} */}
        </div>
      )}
      {step.input && step.input.length > 0 && (
        <div className={clsx("truncate p-1", GridBlockUtils.getClasses(step.inputGrid ?? { columns: "2", gap: "sm" }))}>
          {step.input.map((input, idx) => {
            return (
              <div key={idx}>
                {input.type === "text" && (
                  <InputText
                    name={input.name}
                    title={t(input.title)}
                    required={input.isRequired}
                    value={state?.[input.name] ?? ""}
                    setValue={(e) => setState({ ...state, [input.name]: e.toString() })}
                  />
                )}
                {input.type === "select" && (
                  <InputSelect
                    name={input.name}
                    title={t(input.title)}
                    required={input.isRequired}
                    options={
                      input.options?.map((f) => {
                        return { value: f.value, name: t(f.name) };
                      }) ?? []
                    }
                    value={state?.[input.name] ?? ""}
                    setValue={(e) => setState({ ...state, [input.name]: e?.toString() ?? "" })}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
