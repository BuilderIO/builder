<template>
  <div
    :style="{
      position: 'relative',
    }"
  >
    <video
      class="builder-video"
      :preload="preload || 'metadata'"
      :style="{
        width: '100%',
        height: '100%',
        ...attributes?.style,
        objectFit: fit,
        objectPosition: position,
        // Hack to get object fit to work as expected and
        // not have the video overflow
        zIndex: 2,
        borderRadius: '1px',
        ...(aspectRatio
          ? {
              position: 'absolute',
            }
          : null),
      }"
      :src="video || 'no-src'"
      :poster="posterImage"
      v-bind="spreadProps"
    >
      <template v-if="!lazyLoad">
        <source type="video/mp4" :src="video" />
      </template>
    </video>
    <template
      v-if="aspectRatio && !(fitContent && builderBlock?.children?.length)"
    >
      <div
        :style="{
          width: '100%',
          paddingTop: aspectRatio * 100 + '%',
          pointerEvents: 'none',
          fontSize: '0px',
        }"
      ></div>
    </template>

    <template v-if="builderBlock?.children?.length && fitContent">
      <div
        :style="{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }"
      >
        <slot />
      </div>
    </template>

    <template v-if="builderBlock?.children?.length && !fitContent">
      <div
        :style="{
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
        }"
      >
        <slot />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import type { VideoProps } from "./video.types";

export default defineComponent({
  name: "builder-video",

  props: [
    "autoPlay",
    "muted",
    "controls",
    "loop",
    "playsInline",
    "preload",
    "attributes",
    "fit",
    "position",
    "aspectRatio",
    "video",
    "posterImage",
    "lazyLoad",
    "fitContent",
    "builderBlock",
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
        ...this.videoProps,
      };
    },
  },
});
</script>