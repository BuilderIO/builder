<script context="module" lang="ts">
  /**
   * This import is used by the Svelte SDK. Do not remove.
   */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
  export interface SectionProps {
    maxWidth?: number;
    attributes?: any;
    children?: any;
    builderBlock?: any;
  }
</script>

<script lang="ts">
  import { filterAttrs } from "../helpers.js";
  import { setAttrs } from "../helpers.js";

  export let attributes: SectionProps["attributes"];
  export let maxWidth: SectionProps["maxWidth"];

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

<section
  use:mitosis_styling={{
    width: "100%",
    alignSelf: "stretch",
    flexGrow: 1,
    boxSizing: "border-box",
    maxWidth: maxWidth || 1200,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    marginLeft: "auto",
    marginRight: "auto",
  }}
  {...filterAttrs(attributes, "on:", false)}
  use:setAttrs={filterAttrs(attributes, "on:", true)}
>
  <slot />
</section>