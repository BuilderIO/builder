<script context="module" lang="ts">
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

  const isEvent = (attr) => attr.startsWith("on:");
  const isNonEvent = (attr) => !attr.startsWith("on:");
  const filterAttrs = (attrs = {}, filter) => {
    const validAttr = {};
    Object.keys(attrs).forEach((attr) => {
      if (filter(attr)) {
        validAttr[attr] = attrs[attr];
      }
    });
    return validAttr;
  };
  const setAttrs = (node, attrs = {}) => {
    const attrKeys = Object.keys(attrs);
    const setup = (attr) => node.addEventListener(attr.substr(3), attrs[attr]);
    const teardown = (attr) =>
      node.removeEventListener(attr.substr(3), attrs[attr]);
    attrKeys.map(setup);
    return {
      update(attrs = {}) {
        const attrKeys = Object.keys(attrs);
        attrKeys.map(teardown);
        attrKeys.map(setup);
      },
      destroy() {
        attrKeys.map(teardown);
      },
    };
  };

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
  {...filterAttrs(attributes, isNonEvent)}
  use:setAttrs={filterAttrs(attributes, isEvent)}
/>