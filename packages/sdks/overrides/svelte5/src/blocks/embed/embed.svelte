<script lang="ts">
  import { onMount } from 'svelte';
  import { logger } from '../../helpers/logger.js';
  import { isJsScript } from './helpers.js';

  interface EmbedProps {
    content: string;
  }

  let { content }: EmbedProps = $props();

  let elem = $state<HTMLDivElement>();
  const scriptsInserted: string[] = [];
  const scriptsRun: string[] = [];

  function findAndRunScripts() {
    if (!elem || !elem.getElementsByTagName) return;
    const scripts = elem.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      if (script.src && !scriptsInserted.includes(script.src)) {
        scriptsInserted.push(script.src);
        const newScript = document.createElement('script');
        newScript.async = true;
        newScript.src = script.src;
        document.head.appendChild(newScript);
      } else if (isJsScript(script) && !scriptsRun.includes(script.innerText)) {
        try {
          scriptsRun.push(script.innerText);
          new Function(script.innerText)();
        } catch (error) {
          logger.warn('[BUILDER.IO] `Embed`: Error running script:', error);
        }
      }
    }
  }

  // The source runs this once, when the element ref is first set (`onUpdate(..., [elem, ranInitFn])`).
  onMount(() => {
    findAndRunScripts();
  });
</script>

<div bind:this={elem} class="builder-embed">{@html content}</div>
