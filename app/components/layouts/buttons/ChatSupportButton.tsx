import clsx from "clsx";
import { useState } from "react";

export default function ChatSupportButton() {
  const [isOpen, setIsOpen] = useState(false);
  function onClick() {
    try {
      if (!isOpen) {
        // @ts-ignore
        $crisp?.push(["do", "chat:open"]);
        // @ts-ignore
        $crisp?.push(["do", "chat:show"]);
        setIsOpen(true);
      } else {
        // @ts-ignore
        $crisp?.push(["do", "chat:hide"]);
        setIsOpen(false);
      }
    } catch (e) {
      // ignore
    }
  }
  return (
    <div className="relative hidden sm:inline-flex">
      <div className="relative">
        <div className="inline-flex divide-x divide-gray-300 rounded-sm shadow-none">
          <div className="relative z-0 inline-flex rounded-full text-sm shadow-none">
            <button
              onClick={onClick}
              type="button"
              className={clsx(
                "relative inline-flex items-center rounded-full border border-gray-100 bg-gray-50 p-2 font-medium text-gray-500 shadow-inner hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2"
              )}
              aria-haspopup="listbox"
              aria-expanded="true"
              aria-labelledby="chat-label"
            >
              <span className="sr-only">Chat</span>
              {/*Heroicon name: solid/chevron-down */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
