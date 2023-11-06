import { on, createEffect, createSignal } from "solid-js";

import { isJsScript } from "./helpers.js";

function Embed(props) {
  const [scriptsInserted, setScriptsInserted] = createSignal([]);

  const [scriptsRun, setScriptsRun] = createSignal([]);

  const [ranInitFn, setRanInitFn] = createSignal(false);

  function findAndRunScripts() {
    if (!elem || !elem.getElementsByTagName) return;
    const scripts = elem.getElementsByTagName("script");

    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];

      if (script.src && !scriptsInserted().includes(script.src)) {
        scriptsInserted().push(script.src);
        const newScript = document.createElement("script");
        newScript.async = true;
        newScript.src = script.src;
        document.head.appendChild(newScript);
      } else if (
        isJsScript(script) &&
        !scriptsRun().includes(script.innerText)
      ) {
        try {
          scriptsRun().push(script.innerText);
          new Function(script.innerText)();
        } catch (error) {
          console.warn("`Embed`: Error running script:", error);
        }
      }
    }
  }

  let elem;

  function onUpdateFn_0() {
    if (elem && !ranInitFn()) {
      setRanInitFn(true);
      findAndRunScripts();
    }
  }
  createEffect(on(() => [elem, ranInitFn()], onUpdateFn_0));

  return <div class="builder-embed" ref={elem} innerHTML={props.content}></div>;
}

export default Embed;
