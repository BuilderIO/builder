<script context="module" lang="ts">
  export interface BaseTextProps {
    text: string;
  }
</script>

<script lang="ts">
  import { getContext } from "svelte";

  import BuilderContext from "../context/builder.context.js";

  export let text: BaseTextProps["text"];

  function mitosis_styling(node, vars) {
    Object.entries(vars || {}).forEach(([p, v]) => {
      if (p.startsWith("--")) {
        node.style.setProperty(p, v);
      } else {
        node.style[p] = v;
      }
    });
  }

  let builderContext = getContext(BuilderContext.key);
</script>

<span use:mitosis_styling={builderContext.inheritedStyles}>{text}</span>