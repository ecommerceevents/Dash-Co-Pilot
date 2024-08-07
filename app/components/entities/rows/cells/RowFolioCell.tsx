import { Link } from "@remix-run/react";
import NumberUtils from "~/utils/shared/NumberUtils";

export default function RowFolioCell({ prefix, folio, href, onClick }: { prefix: string; folio: number; href?: string; onClick?: () => void }) {
  function getText() {
    return `${prefix}-${NumberUtils.pad(folio ?? 0, 4)}`;
  }
  return (
    <>
      {href ? (
        <Link
          to={href}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="hover rounded-md border border-b border-gray-200 bg-gray-50 px-1 py-0.5 text-center text-sm text-gray-600 hover:text-gray-800 hover:underline"
        >
          {getText()}
        </Link>
      ) : onClick ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="hover rounded-md border border-b border-gray-200 bg-gray-50 px-1 py-0.5 text-center text-sm text-gray-600 hover:text-gray-800 hover:underline"
        >
          {getText()}
        </button>
      ) : (
        <div>{getText()}</div>
      )}
    </>
  );
}
