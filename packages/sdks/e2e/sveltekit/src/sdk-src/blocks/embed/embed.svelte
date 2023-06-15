<script context="module" lang="ts">
  export interface EmbedProps {
    content: string;
  }
</script>

<script lang="ts">
  import { isJsScript } from "./helpers.js";

  export let content: EmbedProps["content"];

  function findAndRunScripts() {
    if (!elem || !elem.getElementsByTagName) return;
    const scripts = elem.getElementsByTagName("script");
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

  let elem;

  let scriptsInserted = [];
  let scriptsRun = [];
  let ranInitFn = false;

  function onUpdateFn_0() {
    if (elem && !ranInitFn) {
      ranInitFn = true;
      findAndRunScripts();
    }
  }
  $: onUpdateFn_0(...[elem, ranInitFn]);
</script>

<div class="builder-embed" bind:this={elem}>{@html content}</div>