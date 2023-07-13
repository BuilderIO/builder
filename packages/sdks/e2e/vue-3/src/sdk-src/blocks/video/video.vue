<template>
  <video
    :style="{
      width: '100%',
      height: '100%',
      ...attributes?.style,
      objectFit: fit,
      objectPosition: position,
      // Hack to get object fit to work as expected and
      // not have the video overflow
      borderRadius: 1,
    }"
    :src="video || 'no-src'"
    :poster="posterImage"
    v-bind="spreadProps"
  ></video>
</template>

<script lang="ts">
import { defineComponent } from "vue";

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

export default defineComponent({
  name: "builder-video",

  props: [
    "autoPlay",
    "muted",
    "controls",
    "loop",
    "playsInline",
    "attributes",
    "fit",
    "position",
    "video",
    "posterImage",
  ],

  computed: {
    videoProps() {
      return {
        ...(this.autoPlay === true
          ? {
              autoPlay: true,
            }
          : {}),
        ...(this.muted === true
          ? {
              muted: true,
            }
          : {}),
        ...(this.controls === true
          ? {
              controls: true,
            }
          : {}),
        ...(this.loop === true
          ? {
              loop: true,
            }
          : {}),
        ...(this.playsInline === true
          ? {
              playsInline: true,
            }
          : {}),
      };
    },
    spreadProps() {
      return {
        ...this.attributes,
        ...this.videoProps,
      };
    },
  },
});
</script>