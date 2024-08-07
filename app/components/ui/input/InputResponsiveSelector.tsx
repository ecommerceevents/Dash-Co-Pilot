import { ReactNode } from "react";
import { Colors } from "~/application/enums/shared/Colors";
import InputRadioGroup from "./InputRadioGroup";
import InputSelector from "./InputSelector";

interface Props {
  name?: string;
  title?: string;
  value?: string | number | undefined;
  disabled?: boolean;
  options: { name: string | ReactNode; value: string | number | undefined; color?: Colors; disabled?: boolean }[];
  setValue?: React.Dispatch<React.SetStateAction<string | number | undefined>>;
  className?: string;
  withSearch?: boolean;
  withLabel?: boolean;
  withColors?: boolean;
  selectPlaceholder?: string;
  onNew?: () => void;
  onNewRoute?: string;
  required?: boolean;
  help?: string;
  hint?: ReactNode;
  icon?: string;
  borderless?: boolean;
}
export default function InputResponsiveSelector(props: Props) {
  return (
    <>
      <InputSelector className="sm:hidden" {...props} />
      <InputRadioGroup className="hidden sm:block" {...props} />
    </>
  );
}
