import clsx from "~/utils/shared/ClassesUtils";

export default function RatingBadge({ value, size = 4, starsCount = 5 }: { value: number; size?: number; starsCount?: number }) {
  return (
    <div>
      <div className="flex items-center">
        {Array.from({ length: starsCount }).map((_, index) => (
          <Star key={index} size={size} color={index < value ? "yellow" : "gray"} />
        ))}
      </div>
    </div>
  );
}

function Star({ color, size = 5 }: { color: "gray" | "yellow"; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className={clsx(
        size === 2 && "h-2 w-2",
        size === 3 && "h-3 w-3",
        size === 4 && "h-4 w-4",
        size === 5 && "h-5 w-5",
        size === 6 && "h-6 w-6",
        size === 7 && "h-7 w-7",
        color === "gray" ? "text-gray-300" : "text-yellow-400"
      )}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
    </svg>
  );
}
