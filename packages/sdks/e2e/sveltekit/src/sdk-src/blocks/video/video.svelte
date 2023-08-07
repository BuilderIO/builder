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
    preload?: "auto" | "metadata" | "none";
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
  export let autoPlay: VideoProps["autoPlay"];
  export let muted: VideoProps["muted"];
  export let controls: VideoProps["controls"];
  export let loop: VideoProps["loop"];
  export let playsInline: VideoProps["playsInline"];
  export let attributes: VideoProps["attributes"];
  export let preload: VideoProps["preload"];
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
  {...spreadProps()}
  preload={preload || "metadata"}
  src={video || "no-src"}
  poster={posterImage}
/>