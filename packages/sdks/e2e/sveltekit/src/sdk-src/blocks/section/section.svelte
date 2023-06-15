<script context="module" lang="ts">
  export interface SectionProps {
    maxWidth?: number;
    attributes?: any;
    children?: any;
    builderBlock?: any;
  }
</script>

<script lang="ts">
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
  {...filterAttrs(attributes, isNonEvent)}
  use:setAttrs={filterAttrs(attributes, isEvent)}
>
  <slot />
</section>