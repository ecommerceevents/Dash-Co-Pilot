import clsx from "clsx";
import { Colors } from "~/application/enums/shared/Colors";
import { getTextColor } from "~/utils/shared/ColorUtils";

interface Props {
  title?: string;
  color: Colors;
  className?: string;
  children?: React.ReactNode;
}

export default function TextColor({ title, color, className, children }: Props) {
  return <div className={clsx(className, getTextColor(color))}>{title ?? children}</div>;
}
