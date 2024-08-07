import clsx from "clsx";

interface Props {
  items: {
    name: string;
    stat: string;
    hint?: string;
  }[];
}
export default function SimpleStats({ items }: Props) {
  return (
    <div>
      <dl
        className={clsx(
          "grid grid-cols-1 gap-3",
          items.length === 1 && "md:grid-cols-1",
          items.length === 2 && "grid-cols-2",
          items.length === 3 && "md:grid-cols-3"
        )}
      >
        {items.map((item) => (
          <div key={item.name} className="overflow-hidden rounded-lg bg-white px-4 py-3 shadow">
            <dt className="truncate text-xs font-medium text-gray-500">{item.name}</dt>
            <dd className="mt-1 truncate text-lg font-semibold text-gray-900">
              {item.stat} {item.hint && <span className="text-xs text-gray-500">{item.hint}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
