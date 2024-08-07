import clsx from "clsx";
import ButtonSecondary from "../buttons/ButtonSecondary";
import LoadingButton from "../buttons/LoadingButton";

export type WizardStepDto = {
  name: string;
  description?: string;
};

interface Props {
  steps: WizardStepDto[];
  selectedStep: number;
  onSetStep: (step: number, direction: "next" | "back" | undefined) => void;
  children: React.ReactNode;
  breakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export default function WizardSteps({ steps, selectedStep, onSetStep, children, className, breakpoint = "md" }: Props) {
  const canGoBack = selectedStep > 0;
  const canGoNext = selectedStep < steps.length - 1;
  const backTitle = canGoBack ? steps[selectedStep - 1].name : "Back";
  const nextTitle = canGoNext ? steps[selectedStep + 1].name : "Next";
  function onBack() {
    if (canGoBack) {
      onSetStep(selectedStep - 1, "back");
    }
  }
  function onNext() {
    if (canGoNext) {
      onSetStep(selectedStep + 1, "next");
    }
  }
  return (
    <div className="relative">
      <div
        className={clsx(
          "p-1",
          breakpoint === "sm" && "sm:hidden",
          breakpoint === "md" && "md:hidden",
          breakpoint === "lg" && "lg:hidden",
          breakpoint === "xl" && "xl:hidden",
          breakpoint === "2xl" && "2xl:hidden"
        )}
      >
        <label htmlFor="tabs" className="sr-only">
          Select
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-accent-500 focus:ring-accent-500"
          onChange={(e) => onSetStep(Number(e.target.value), undefined)}
          value={selectedStep}
        >
          {steps.map((item, idx) => {
            return (
              <option key={item.name} value={Number(idx)}>
                {item.name}
              </option>
            );
          })}
        </select>
      </div>
      <div
        className={clsx(
          className,
          breakpoint === "sm" && "sm:flex sm:space-x-4",
          breakpoint === "md" && "md:flex md:space-x-4",
          breakpoint === "lg" && "lg:flex lg:space-x-4",
          breakpoint === "xl" && "xl:flex xl:space-x-4",
          breakpoint === "2xl" && "2xl:flex 2xl:space-x-4"
        )}
      >
        <div className="hidden overflow-auto p-3 md:block md:w-1/4">
          <nav aria-label="Progress">
            <ol className="overflow-hidden">
              {steps.map((step, stepIdx) => (
                <li key={step.name} className={clsx(stepIdx !== steps.length - 1 ? "pb-10" : "", "relative")}>
                  {stepIdx !== steps.length - 1 ? <div className="absolute left-3 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" aria-hidden="true" /> : null}
                  <button type="button" onClick={() => onSetStep(stepIdx, undefined)} className="group relative flex items-start text-left">
                    <span className="flex h-9 items-center" aria-hidden="true">
                      <span
                        className={clsx(
                          "relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300 bg-white",
                          stepIdx === selectedStep ? "border-theme-600 group-hover:border-theme-600" : "group-hover:border-theme-600"
                        )}
                      >
                        {stepIdx === selectedStep ? (
                          <span className="h-2.5 w-2.5 rounded-full bg-theme-600" />
                        ) : (
                          <span className="h-2.5 w-2.5 rounded-full bg-gray-400 group-hover:bg-theme-600" />
                        )}
                      </span>
                    </span>
                    <span className="ml-4 flex min-w-0 flex-col">
                      <span className="text-sm font-medium text-gray-600">{step.name}</span>
                      <span className="line-clamp-2 text-sm text-gray-500">{step.description}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <div className="h-full w-full overflow-auto pb-20 md:w-3/4">{children}</div>
      </div>
      <div className="sticky bottom-0 -mx-8 bg-gray-100 px-4 py-3 shadow-inner md:py-2">
        <div className="flex w-full justify-between space-x-2">
          <div>
            {canGoBack && (
              <ButtonSecondary onClick={onBack}>
                <div className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path
                      fillRule="evenodd"
                      d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>{backTitle}</div>
              </ButtonSecondary>
            )}
          </div>
          <div>
            {canGoNext && (
              <LoadingButton onClick={onNext}>
                <div className="flex items-center space-x-2">
                  <div>{nextTitle}</div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path
                      fillRule="evenodd"
                      d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </LoadingButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
