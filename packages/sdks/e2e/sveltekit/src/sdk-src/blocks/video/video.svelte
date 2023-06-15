<script context="module" lang="ts">
  export interface VideoProps {
    attributes?: any;
    video?: string;
    autoPlay?: boolean;
    controls?: boolean;
    muted?: boolean;
    loop?: boolean;
    playsInline?: boolean;
    aspectRatio?: number;
    width?: number;
    height?: number;
    fit?: "contain" | "cover" | "fill";
    position?:
      | "center"
      | "top"
      | "left"
      | "right"
      | "bottom"
      | "top left"
      | "top right"
      | "bottom left"
      | "bottom right";
    posterImage?: string;
    lazyLoad?: boolean;
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

  export let autoPlay: VideoProps["autoPlay"];
  export let muted: VideoProps["muted"];
  export let controls: VideoProps["controls"];
  export let loop: VideoProps["loop"];
  export let playsInline: VideoProps["playsInline"];
  export let attributes: VideoProps["attributes"];
  export let fit: VideoProps["fit"];
  export let position: VideoProps["position"];
  export let video: VideoProps["video"];
  export let posterImage: VideoProps["posterImage"];

  function mitosis_styling(node, vars) {
    Object.entries(vars || {}).forEach(([p, v]) => {
      if (p.startsWith("--")) {
        node.style.setProperty(p, v);
      } else {
        node.style[p] = v;
      }
    });
  }

  $: videoProps = () => {
    return {
      ...(autoPlay === true
        ? {
            autoPlay: true,
          }
        : {}),
      ...(muted === true
        ? {
            muted: true,
          }
        : {}),
      ...(controls === true
        ? {
            controls: true,
          }
        : {}),
      ...(loop === true
        ? {
            loop: true,
          }
        : {}),
      ...(playsInline === true
        ? {
            playsInline: true,
          }
        : {}),
    };
  };
  $: spreadProps = () => {
    return {
      ...attributes,
      ...videoProps(),
    };
  };
</script>

<video
  use:mitosis_styling={{
    width: "100%",
    height: "100%",
    ...attributes?.style,
    objectFit: fit,
    objectPosition: position,
    // Hack to get object fit to work as expected and
    // not have the video overflow
    borderRadius: 1,
  }}
  {...filterAttrs(spreadProps(), isNonEvent)}
  src={video || "no-src"}
  poster={posterImage}
  use:setAttrs={filterAttrs(spreadProps(), isEvent)}
/>