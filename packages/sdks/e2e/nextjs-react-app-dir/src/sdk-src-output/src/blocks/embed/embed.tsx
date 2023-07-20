'use client';
import * as React from "react";

export interface EmbedProps {
  content: string;
}

import { isJsScript } from "./helpers";

function Embed(props: EmbedProps) {
  const _context = { ...props["_context"] };

  const state = {
    scriptsInserted: [],
    scriptsRun: [],
    ranInitFn: false,
    findAndRunScripts() {
      if (!elem || !elem.getElementsByTagName) return;
      const scripts = elem.getElementsByTagName("script");
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        if (script.src && !state.scriptsInserted.includes(script.src)) {
          state.scriptsInserted.push(script.src);
          const newScript = document.createElement("script");
          newScript.async = true;
          newScript.src = script.src;
          document.head.appendChild(newScript);
        } else if (
          isJsScript(script) &&
          !state.scriptsRun.includes(script.innerText)
        ) {
          try {
            state.scriptsRun.push(script.innerText);
            new Function(script.innerText)();
          } catch (error) {
            console.warn("`Embed`: Error running script:", error);
          }
        }
      }
    },
  };

  return (
    <div
      className="builder-embed"
      dangerouslySetInnerHTML={{ __html: props.content }}
    />
  );
}

export default Embed;
