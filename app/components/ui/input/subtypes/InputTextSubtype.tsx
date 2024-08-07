import { Fragment } from "react";
import InputText from "../InputText";
import InputEmail from "./InputEmail";
import InputPhone from "./InputPhone";
import InputUrl from "./InputUrl";
import { PromptFlowWithDetails } from "~/modules/promptBuilder/db/promptFlows.db.server";

type InputTextSubtypeProps = {
  subtype: "singleLine" | "email" | "phone" | "url" | null;
  name?: string;
  title?: string;
  withLabel?: boolean;
  // value: string | undefined;
  // setValue: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  classNameBg?: string;
  minLength?: number;
  maxLength?: number;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  translationParams?: string[];
  placeholder?: string;
  pattern?: string;
  rows?: number;
  button?: React.ReactNode;
  lowercase?: boolean;
  uppercase?: boolean;
  password?: boolean;
  type?: string;
  darkMode?: boolean;
  hint?: React.ReactNode;
  help?: string;
  icon?: string;
  editor?: string; // monaco
  editorLanguage?: string; // "javascript" | "typescript" | "html" | "css" | "json";
  editorHideLineNumbers?: boolean;
  editorTheme?: "vs-dark" | "light";
  editorFontSize?: number;
  onBlur?: () => void;
  borderless?: boolean;
  editorSize?: "sm" | "md" | "lg" | "auto" | "full" | "screen";
  autoFocus?: boolean;
  promptFlows?: { rowId: string | undefined; prompts: PromptFlowWithDetails[] } | undefined;
};

type WithDefaultValue = { defaultValue: string | undefined };
type WithValueAndSetValue = { value: string | undefined; setValue: React.Dispatch<React.SetStateAction<string>> };

export default function InputTextSubtype(props: InputTextSubtypeProps & (WithDefaultValue | WithValueAndSetValue)) {
  return (
    <>
      {!props.subtype || props.subtype === "singleLine" ? (
        <Fragment>
          <InputText {...props} type={props.password ? "password" : undefined} autoComplete={props.password ? "off" : undefined} />
        </Fragment>
      ) : props.subtype === "email" ? (
        <InputEmail {...props} />
      ) : props.subtype === "url" ? (
        <InputUrl {...props} />
      ) : props.subtype === "phone" ? (
        <InputPhone {...props} />
      ) : null}
    </>
  );
}
