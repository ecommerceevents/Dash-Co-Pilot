import hljs from "highlight.js";

export default function CodeBlock({ code, language = "ts" }: { code: string; language?: "js" | "ts" | "shell" }) {
  return (
    <div className="prose">
      <pre data-syntax={language}>
        <code
          className={`hljs language-${language}`}
          dangerouslySetInnerHTML={{
            __html: hljs.highlight(String(code), {
              language,
              ignoreIllegals: true,
            }).value,
          }}
        />
      </pre>
    </div>
  );
}
