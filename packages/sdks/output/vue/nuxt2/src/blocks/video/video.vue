<template>
  <video
    v-bind="attributes"
    preload="none"
    :style="{
  width: '100%',
  height: '100%',
  ...(attributes && attributes.style),
  objectFit: fit,
  objectPosition: position,
  // Hack to get object fit to work as expected and
  // not have the video overflow
  borderRadius: 1
}"
    :key="video || 'no-src'"
    :poster="posterImage"
    :autoPlay="autoPlay"
    :muted="muted"
    :controls="controls"
    :loop="loop"
  ></video>
</template>
<script>
export default {
  name: "builder-video",

  props: [
    "attributes",
    "fit",
    "position",
    "video",
    "posterImage",
    "autoPlay",
    "muted",
    "controls",
    "loop",
  ],
};
</script>
