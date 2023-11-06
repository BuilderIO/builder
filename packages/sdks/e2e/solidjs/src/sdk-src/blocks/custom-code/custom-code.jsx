import { onMount, createSignal } from "solid-js";

function CustomCode(props) {
  const [scriptsInserted, setScriptsInserted] = createSignal([]);

  const [scriptsRun, setScriptsRun] = createSignal([]);

  function findAndRunScripts() {
    // TODO: Move this function to standalone one in '@builder.io/utils'
    if (elem && elem.getElementsByTagName && typeof window !== "undefined") {
      const scripts = elem.getElementsByTagName("script");

      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];

        if (script.src) {
          if (scriptsInserted().includes(script.src)) {
            continue;
          }

          scriptsInserted().push(script.src);
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
          if (scriptsRun().includes(script.innerText)) {
            continue;
          }

          try {
            scriptsRun().push(script.innerText);
            new Function(script.innerText)();
          } catch (error) {
            console.warn("`CustomCode`: Error running script:", error);
          }
        }
      }
    }
  }

  let elem;

  onMount(() => {
    findAndRunScripts();
  });

  return (
    <div
      class={
        "builder-custom-code" + (props.replaceNodes ? " replace-nodes" : "")
      }
      ref={elem}
      innerHTML={props.code}
    ></div>
  );
}

export default CustomCode;
