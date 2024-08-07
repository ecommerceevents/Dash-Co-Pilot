import clsx from "clsx";

interface Props {
  onClick: () => void;
}
export default function SearchButton({ onClick }: Props) {
  return (
    <div className="relative">
      <div className="inline-flex divide-x divide-gray-300 rounded-sm shadow-none">
        <button
          onClick={onClick}
          className={clsx(
            "relative inline-flex items-center rounded-full border border-gray-100 bg-gray-50 p-2 font-medium text-gray-500 shadow-inner hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2"
          )}
        >
          <span className="inline-block h-5 w-5 overflow-hidden rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );

  // <div className="w-full flex md:ml-0">
  //   <div className="align-baseline w-full text-slate-200 pl-1">
  //     <div className="w-full">
  //       <label htmlFor="command-palette" className="sr-only">
  //         {t("shared.commandPalette")}
  //       </label>
  //       <div className="relative text-gray-400 hover:text-gray-500 truncate">

  //         <button
  //           type="button"
  //           onClick={onOpenCommandPalette}
  //           className="flex space-x-2 text-left w-full pl-3 pr-3 py-1.5 text-sm sm:py-2 border border-gray-200 rounded-md leading-5 bg-gray-50 text-gray-400 focus:outline-none hover:ring-0 hover:placeholder-gray-500 hover:text-gray-500 truncate"
  //         >
  //           <div className="font-medium hidden lg:block">⌘K</div>
  //           <div className="hidden lg:block truncate">{t("shared.commandPalette")}</div>
  //           <div className="lg:hidden">{t("shared.search")}</div>
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // </div>
}
