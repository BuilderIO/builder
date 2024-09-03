<template>
  <DynamicRenderer
    :attributes="attrs()"
    :TagName="link ? builderLinkComponent || 'a' : 'button'"
    :actionAttributes="filterAttrs(attributes, 'v-on:', true)"
    >{{ text }}</DynamicRenderer
  >
</template>

<script lang="ts">
import { defineComponent } from "vue";

import DynamicRenderer from "../../components/dynamic-renderer/dynamic-renderer.vue";
import { getClassPropName } from "../../functions/get-class-prop-name";
import { filterAttrs } from "../helpers";
import type { ButtonProps } from "./button.types";

export default defineComponent({
  name: "builder-button",
  components: { DynamicRenderer: DynamicRenderer },
  props: [
    "attributes",
    "link",
    "openLinkInNewTab",
    "builderLinkComponent",
    "text",
  ],

  data() {
    return { filterAttrs };
  },

  methods: {
    attrs() {
      return {
        ...filterAttrs(this.attributes, "v-on:", false),
        [getClassPropName()]: `${this.link ? "" : "builder-button"} ${
          this.attributes[getClassPropName()] || ""
        }`,
        ...(this.link
          ? {
              href: this.link,
              target: this.openLinkInNewTab ? "_blank" : undefined,
              role: "link",
            }
          : {
              role: "button",
            }),
      };
    },
  },
});
</script>