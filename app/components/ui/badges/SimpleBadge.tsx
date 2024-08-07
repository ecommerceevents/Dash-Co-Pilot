import clsx from "clsx";
import { Colors } from "~/application/enums/shared/Colors";
import { getBadgeColor, getBadgeColorDark } from "~/utils/shared/ColorUtils";

interface Props {
  title?: string;
  color: Colors;
  className?: string;
  children?: React.ReactNode;
  underline?: boolean;
  darkMode?: boolean;
}

export default function SimpleBadge({ title, color, className, children, underline, darkMode }: Props) {
  return (
    <div
      className={clsx(
        className,
        !underline && "inline-flex",
        "items-center rounded-md px-1 py-0 text-xs font-bold",
        getBadgeColor(color),
        darkMode && getBadgeColorDark(color)
      )}
    >
      {title ?? children}
    </div>
  );
}
