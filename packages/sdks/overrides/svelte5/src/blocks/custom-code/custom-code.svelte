<script lang="ts">
  import { onMount } from 'svelte';
  import { isEditing } from '../../functions/is-editing.js';
  import { logger } from '../../helpers/logger.js';

  interface CustomCodeProps {
    code: string;
    replaceNodes?: boolean;
  }

  let { code, replaceNodes }: CustomCodeProps = $props();

  let elementRef = $state<HTMLDivElement>();
  const scriptsInserted: string[] = [];
  const scriptsRun: string[] = [];

  function runScripts() {
    if (!elementRef || !elementRef?.getElementsByTagName || typeof window === 'undefined') {
      return;
    }

    const scripts = elementRef.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      if (script.src) {
        if (scriptsInserted.includes(script.src)) continue;
        scriptsInserted.push(script.src);
        const newScript = document.createElement('script');
        newScript.async = true;
        newScript.src = script.src;
        document.head.appendChild(newScript);
      } else if (
        !script.type ||
        ['text/javascript', 'application/javascript', 'application/ecmascript'].includes(
          script.type
        )
      ) {
        if (scriptsRun.includes(script.innerText)) continue;
        try {
          scriptsRun.push(script.innerText);
          new Function(script.innerText)();
        } catch (error) {
          logger.warn('[BUILDER.IO] `CustomCode`: Error running script:', error);
        }
      }
    }
  }

  onMount(() => {
    runScripts();
  });

  // `onUpdate(..., [props.code])`: in the editor, run the new code's scripts once it is in the DOM.
  $effect.pre(() => {
    void code;
    if (isEditing()) {
      setTimeout(() => {
        runScripts();
      }, 0);
    }
  });
</script>

<div
  bind:this={elementRef}
  class={'builder-custom-code' + (replaceNodes ? ' replace-nodes' : '')}
>{@html code}</div>
