import { useTranslation } from "react-i18next";
import { SetupItem } from "~/application/dtos/setup/SetupItem";
import ButtonSecondary from "../ui/buttons/ButtonSecondary";
import clsx from "clsx";

interface Props {
  items: SetupItem[];
}

function CompletedIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rounded-full border border-gray-300 text-gray-200" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 " clipRule="evenodd" />
    </svg>
  );
}

function IncompletedIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rounded-full border border-teal-500 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SetupStep({ item, index, total }: { item: SetupItem; index: number; total: number }) {
  const { t } = useTranslation();

  return (
    <li key={index} className="space-y-3 rounded-lg border border-gray-300 bg-white p-4">
      <div className="flex items-center space-x-2">
        <div className="flex-shrink-0">{!item.completed ? <CompletedIcon /> : <IncompletedIcon />}</div>
        <div className="flex w-full justify-between">
          <div className="font-medium">{item.title}</div>
          <div className=" text-sm text-gray-400">
            {index + 1}/{total}
          </div>
        </div>
      </div>
      <p className=" text-sm">{item.description}</p>
      <div>
        <ButtonSecondary to={item.path} className="mt-3">
          {!item.completed ? t("app.sidebar.setup") : `${t("shared.goTo")} ${item.title.toLowerCase()}`} &rarr;
        </ButtonSecondary>
      </div>
    </li>
  );
}

export default function SetupSteps({ items }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <h3 className=" font-medium leading-4 text-gray-900">{t("onboarding.gettingStarted.title")}</h3>
      <ul
        className={clsx(
          "mt-3 grid grid-cols-1 gap-4",
          items.length === 1 && "lg:grid-cols-3",
          items.length === 2 && "lg:grid-cols-2",
          items.length === 3 && "lg:grid-cols-3",
          items.length === 4 && "lg:grid-cols-2",
          items.length === 5 && "lg:grid-cols-3",
          items.length === 6 && "lg:grid-cols-3",
          items.length === 7 && "lg:grid-cols-4",
          items.length === 8 && "lg:grid-cols-4",
          items.length === 9 && "lg:grid-cols-3",
          items.length === 10 && "lg:grid-cols-5",
          items.length === 11 && "lg:grid-cols-4",
          items.length === 12 && "lg:grid-cols-4"
        )}
      >
        {items.map((item, index) => (
          <SetupStep key={index} item={item} index={index} total={items.length} />
        ))}
      </ul>
    </div>
  );
}
