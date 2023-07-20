'use client';
import * as React from "react";

export interface CustomCodeProps {
  code: string;
  replaceNodes?: boolean;
}

function CustomCode(props: CustomCodeProps) {
  const _context = { ...props["_context"] };

  const state = {
    scriptsInserted: [],
    scriptsRun: [],
    findAndRunScripts() {
      // TODO: Move this function to standalone one in '@builder.io/utils'
      if (elem && elem.getElementsByTagName && typeof window !== "undefined") {
        const scripts = elem.getElementsByTagName("script");
        for (let i = 0; i < scripts.length; i++) {
          const script = scripts[i];
          if (script.src) {
            if (state.scriptsInserted.includes(script.src)) {
              continue;
            }
            state.scriptsInserted.push(script.src);
            const newScript = document.createElement("script");
            newScript.async = true;
            newScript.src = script.src;
            document.head.appendChild(newScript);
          } else if (
            !script.type ||
            [
              "text/javascript",
              "application/javascript",
              "application/ecmascript",
            ].includes(script.type)
          ) {
            if (state.scriptsRun.includes(script.innerText)) {
              continue;
            }
            try {
              state.scriptsRun.push(script.innerText);
              new Function(script.innerText)();
            } catch (error) {
              console.warn("`CustomCode`: Error running script:", error);
            }
          }
        }
      }
    },
  };

  return (
    <div
      className={
        "builder-custom-code" + (props.replaceNodes ? " replace-nodes" : "")
      }
      dangerouslySetInnerHTML={{ __html: props.code }}
    />
  );
}

export default CustomCode;
