"use client";
import * as React from "react";
import { useState, useRef, useEffect } from "react";

export interface EmbedProps {
  content: string;
}

import { isJsScript } from "./helpers";

function Embed(props: EmbedProps) {
  const elem = useRef<HTMLDivElement>(null);
  const [scriptsInserted, setScriptsInserted] = useState(() => [] as any);

  const [scriptsRun, setScriptsRun] = useState(() => [] as any);

  const [ranInitFn, setRanInitFn] = useState(() => false);

  function findAndRunScripts() {
    if (!elem.current || !elem.current.getElementsByTagName) return;
    const scripts = elem.current.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      if (script.src && !scriptsInserted.includes(script.src)) {
        scriptsInserted.push(script.src);
        const newScript = document.createElement("script");
        newScript.async = true;
        newScript.src = script.src;
        document.head.appendChild(newScript);
      } else if (isJsScript(script) && !scriptsRun.includes(script.innerText)) {
        try {
          scriptsRun.push(script.innerText);
          new Function(script.innerText)();
        } catch (error) {
          console.warn("`Embed`: Error running script:", error);
        }
      }
    }
  }

  useEffect(() => {
    if (elem.current && !ranInitFn) {
      setRanInitFn(true);
      findAndRunScripts();
    }
  }, [elem.current, ranInitFn]);

  return (
    <div
      className="builder-embed"
      ref={elem}
      dangerouslySetInnerHTML={{ __html: props.content }}
    />
  );
}

export default Embed;
