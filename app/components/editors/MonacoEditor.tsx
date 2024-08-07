import { Editor, useMonaco } from "@monaco-editor/react";
import clsx from "clsx";
import { Fragment, useEffect } from "react";

export type MonacoAutoCompletion = {
  label: string;
  kind: any;
  documentation: string;
  insertText: string;
  insertTextRules?: any;
};
interface Props {
  name?: string;
  value: string;
  onChange?: (value: string) => void;
  theme?: "vs-dark" | "light";
  hideLineNumbers?: boolean;
  language?: "javascript" | "typescript" | "html" | "css" | "json" | "markdown" | "yaml" | "sql";
  fontSize?: number;
  className?: string;
  autocompletions?: MonacoAutoCompletion[];
  tabSize?: number;
  onControlEnter?: () => void;
}

let registerCompletion: any;

export default function MonacoEditor({
  name,
  value,
  onChange,
  theme,
  hideLineNumbers,
  language,
  fontSize,
  className,
  autocompletions,
  tabSize = 4,
  onControlEnter,
}: Props) {
  const monaco = useMonaco();

  useEffect(() => {
    function createDependencyProposals(autocompletions: MonacoAutoCompletion[], range: any) {
      return autocompletions.map((f) => {
        return {
          ...f,
          range: range,
        };
      });
    }

    if (monaco) {
      if (onControlEnter) {
        const executeAction: any = {
          id: "onControlEnter",
          label: "Execute",
          contextMenuOrder: 2,
          contextMenuGroupId: "1_modification",
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
          run: onControlEnter,
        };
        monaco.editor.addEditorAction(executeAction);
      }

      if (registerCompletion) {
        registerCompletion.dispose();
      }
      registerCompletion = monaco.languages.registerCompletionItemProvider("markdown", {
        provideCompletionItems: function (model: any, position: any) {
          // find out if we are completing a property in the 'dependencies' object.
          // var textUntilPosition = model.getValueInRange({
          //   startLineNumber: 1,
          //   startColumn: 1,
          //   endLineNumber: position.lineNumber,
          //   endColumn: position.column,
          // });
          // var match = textUntilPosition.match(/"dependencies"\s*:\s*\{\s*("[^"]*"\s*:\s*"[^"]*"\s*,\s*)*([^"]*)?$/);
          // if (!match) {
          //   return { suggestions: [] };
          // }
          var word = model.getWordUntilPosition(position);
          var range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          return {
            suggestions: createDependencyProposals(autocompletions ?? [], range),
          };
        },
      });
    }

    return () => {
      if (registerCompletion) {
        registerCompletion.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autocompletions, monaco]);

  return (
    <Fragment>
      {name && <textarea name={name} value={value} hidden readOnly />}
      {typeof window !== "undefined" && (
        <Editor
          loading={<div className={clsx(className)}></div>}
          theme={theme}
          className={clsx(
            className,
            "focus:border-accent-500 focus:ring-accent-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm",
            hideLineNumbers && "-ml-10"
          )}
          // defaultLanguage={editorLanguage}
          language={language}
          options={{
            fontSize,
            renderValidationDecorations: "off",
            wordWrap: "on",
            unusualLineTerminators: "off",
            tabSize,
          }}
          value={value}
          onChange={(e) => (onChange ? onChange(e ?? "") : null)}
        />
      )}
    </Fragment>
  );
}
