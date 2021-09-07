<template>
  <span><slot></slot></span>
</template>
<script>
import { registerComponent } from "@builder.io/sdk-vue";

export default registerComponent(
  {
    name: "builder-fragment-component",

    props: [],
  },
  {
    name: "Fragment",
    static: true,
    hidden: true,
    builtIn: true,
    canHaveChildren: true,
    noWrap: true,
  }
);
</script>
