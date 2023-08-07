<script context="module" lang="ts">
  /**
   * This import is used by the Svelte SDK. Do not remove.
   */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
  export interface ImgProps {
    attributes?: any;
    imgSrc?: string; // TODO(misko): I think this is unused
    image?: string;
    altText?: string;
    backgroundSize?: "cover" | "contain";
    backgroundPosition?:
      | "center"
      | "top"
      | "left"
      | "right"
      | "bottom"
      | "top left"
      | "top right"
      | "bottom left"
      | "bottom right";
  }
</script>

<script lang="ts">
  import { isEditing } from "../../functions/is-editing.js";
  import { filterAttrs } from "../helpers.js";
  import { setAttrs } from "../helpers.js";

  export let backgroundSize: ImgProps["backgroundSize"];
  export let backgroundPosition: ImgProps["backgroundPosition"];
  export let imgSrc: ImgProps["imgSrc"];
  export let altText: ImgProps["altText"];
  export let image: ImgProps["image"];
  export let attributes: ImgProps["attributes"];

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

<img
  use:mitosis_styling={{
    objectFit: backgroundSize || "cover",
    objectPosition: backgroundPosition || "center",
  }}
  key={(isEditing() && imgSrc) || "default-key"}
  alt={altText}
  src={imgSrc || image}
  {...filterAttrs(attributes, "on:", false)}
  use:setAttrs={filterAttrs(attributes, "on:", true)}
/>