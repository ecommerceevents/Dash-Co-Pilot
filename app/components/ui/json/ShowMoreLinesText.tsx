import clsx from "clsx";
import { useState } from "react";

export default function ShowMoreLinesText({
  lines = "1",
  children,
  className,
}: {
  lines?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
  children?: React.ReactNode;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={clsx(
        className,
        "cursor-pointer",
        expanded
          ? "line-clamp-none"
          : clsx(
              lines === "1" && "line-clamp-1",
              lines === "2" && "line-clamp-2",
              lines === "3" && "line-clamp-3",
              lines === "4" && "line-clamp-4",
              lines === "5" && "line-clamp-5",
              lines === "6" && "line-clamp-6",
              lines === "7" && "line-clamp-7",
              lines === "8" && "line-clamp-8"
            )
      )}
    >
      {children}
    </div>
  );
}
