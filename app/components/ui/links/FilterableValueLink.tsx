import { useSearchParams } from "@remix-run/react";

export function FilterableValueLink({ name, value, param, children }: { name: string; value: string | undefined; param?: string; children?: React.ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  function isFiltered() {
    if (param) {
      return searchParams.get(name) === param;
    }
    return searchParams.get(name) === value;
  }
  return (
    <div>
      {!isFiltered() ? (
        <button
          type="button"
          onClick={() => {
            searchParams.set(name, param ?? value ?? "");
            searchParams.delete("page");
            setSearchParams(searchParams);
          }}
          className="hover:text-blue-700 hover:underline"
        >
          {children ?? value}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            searchParams.delete(name);
            searchParams.delete("page");
            setSearchParams(searchParams);
          }}
          className="underline hover:text-gray-500 hover:line-through"
        >
          {children ?? value}
        </button>
      )}
    </div>
  );
}
