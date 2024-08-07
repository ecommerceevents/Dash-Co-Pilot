import { useEffect } from "react";

interface ScriptInjectorProps {
  scripts?: {
    head: string | null;
    body: string | null;
  };
}

const ScriptInjector = ({ scripts }: ScriptInjectorProps) => {
  useEffect(() => {
    if (scripts?.head) {
      const headDiv = document.createElement("div");
      headDiv.innerHTML = scripts.head;
      Array.from(headDiv.childNodes).forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const script = document.createElement("script");
          Array.from((node as Element).attributes).forEach((attr) => {
            script.setAttribute(attr.name, attr.value);
          });
          script.innerHTML = (node as Element).innerHTML;
          document.head.appendChild(script);
        }
      });
    }

    if (scripts?.body) {
      const bodyDiv = document.createElement("div");
      bodyDiv.innerHTML = scripts.body;
      Array.from(bodyDiv.childNodes).forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const script = document.createElement("script");
          Array.from((node as Element).attributes).forEach((attr) => {
            script.setAttribute(attr.name, attr.value);
          });
          script.innerHTML = (node as Element).innerHTML;
          document.body.appendChild(script);
        }
      });
    }
  }, [scripts]);

  return null;
};

export default ScriptInjector;
