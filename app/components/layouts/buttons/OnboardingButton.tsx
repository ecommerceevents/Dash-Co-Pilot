import clsx from "~/utils/shared/ClassesUtils";
import { OnboardingSessionWithDetails } from "~/modules/onboarding/db/onboardingSessions.db.server";
import BycicleIcon from "~/components/ui/icons/onboardings/BycicleIcon";

export default function OnboardingButton({ item, onClick }: { item: OnboardingSessionWithDetails; onClick?: () => void }) {
  return (
    <div className="inline-flex divide-x divide-theme-300 rounded-full shadow-none sm:rounded-md">
      <div className="relative z-0 inline-flex rounded-full text-xs shadow-none sm:text-sm">
        <button
          type="button"
          onClick={onClick}
          className={clsx(
            "relative inline-flex items-center rounded-full border border-theme-100 bg-theme-50 p-2 font-medium text-theme-500 shadow-inner hover:bg-theme-100 hover:text-theme-800 focus:z-10 focus:bg-theme-100 focus:text-theme-900 focus:outline-none sm:rounded-md",
            "flex px-3 text-theme-900 hover:bg-theme-200 hover:text-theme-800 focus:z-10 focus:bg-theme-100 focus:text-theme-900 focus:outline-none"
          )}
          aria-haspopup="listbox"
          aria-expanded="true"
          aria-labelledby="listbox-label"
        >
          <div className="hidden lg:block">{item.onboarding.title}</div>
          <BycicleIcon className={clsx("h-5 w-5", item.onboarding.title.length > 0 && "lg:ml-2")} />
        </button>
      </div>
    </div>
  );
}
