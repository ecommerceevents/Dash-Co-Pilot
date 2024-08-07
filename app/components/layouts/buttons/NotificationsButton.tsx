import clsx from "clsx";

interface Props {
  unseenCount?: number;
}
export default function NotificationsButton({ unseenCount }: Props) {
  return (
    <div className="relative">
      <div className="inline-flex divide-x divide-gray-300 rounded-sm shadow-none">
        <button
          className={clsx(
            "relative inline-flex items-center rounded-full border border-gray-100 bg-gray-50 p-2 font-medium text-gray-500 shadow-inner hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2"
          )}
        >
          <span className="relative inline-block h-5 w-5 overflow-hidden rounded-full">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          {unseenCount?.toString() !== "0" && (
            <span className="absolute inset-0 -mr-6 object-right-top">
              <div className="inline-flex items-center rounded-full border-2 border-white bg-red-500 px-1.5 py-0.5 text-xs font-semibold leading-4 text-white">
                {unseenCount}
              </div>
            </span>
          )}
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
