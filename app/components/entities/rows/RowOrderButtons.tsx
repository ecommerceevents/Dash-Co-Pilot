import clsx from "clsx";
import { useSubmit, useNavigation } from "@remix-run/react";

interface Props {
  id: string;
  order: number;
  editable?: boolean;
}
export default function RowOrderButtons({ id, order, editable = true }: Props) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";
  function changeOrder(forward: boolean) {
    const form = new FormData();
    form.set("action", forward ? "move-down" : "move-up");
    form.set("id", id);
    submit(form, {
      method: "post",
    });
  }
  return (
    <div className="flex items-center space-x-1 truncate">
      <button
        type="button"
        onClick={() => changeOrder(false)}
        className={clsx(
          !editable || loading ? " cursor-not-allowed bg-gray-100 text-gray-300" : "hover:bg-gray-100 hover:text-gray-800",
          "h-4 w-4 bg-gray-50 px-0.5 py-0.5 text-gray-500 focus:outline-none"
        )}
        disabled={!editable || loading}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => changeOrder(true)}
        className={clsx(
          !editable || loading ? " cursor-not-allowed bg-gray-100 text-gray-300" : "hover:bg-gray-100 hover:text-gray-800",
          "h-4 w-4 bg-gray-50 px-0.5 py-0.5 text-gray-500 focus:outline-none"
        )}
        disabled={!editable || loading}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
