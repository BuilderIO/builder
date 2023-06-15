<script context="module" lang="ts">
  export interface TextProps {
    text: string;
  }
</script>

<script lang="ts">
  export let text: TextProps["text"];

  function mitosis_styling(node, vars) {
    Object.entries(vars || {}).forEach(([p, v]) => {
      if (p.startsWith("--")) {
        node.style.setProperty(p, v);
      } else {
        node.style[p] = v;
      }
    });
  }
</script>

<span
  use:mitosis_styling={{
    outline: "none",
  }}
  class="builder-text">{@html text}</span
>