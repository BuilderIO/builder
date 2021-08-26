<template>
  <div
    @click="
      track('click', {
        contentId: content.id,
      })
    "
    :data-builder-content-id="content?.id"
  >
    <template v-if="useContent?.data?.cssCode && !isReactNative()">
      <component is="style">{{ useContent.data.cssCode }}</component>
    </template>
    <template
      :key="block.id"
      v-for="(block, index) in useContent?.data?.blocks"
    >
      <render-block :block="block"></render-block>
    </template>
  </div>
</template>
<script>
import { isBrowser } from "../functions/is-browser";
import RenderBlock from "./render-block.lite";
import BuilderContext from "../context/builder.context.lite";
import { track } from "../functions/track";
import { ifTarget } from "../functions/if-target";
import { onChange } from "../functions/on-change";
import { isReactNative } from "../functions/is-react-native";

export default {
  name: "RenderContent",
  components: { RenderBlock },
  props: ["content", "model"],

  data: () => ({
    update: 0,
    state: {},
    context: {},
    overrideContent: null,
    RenderBlock,
    track,
    isReactNative,
  }),

  provide() {
    const _this = this;
    return {
      BuilderContext: {
        get content() {
          return _this.content;
        },
        get state() {
          return _this.state;
        },
        get context() {
          return _this.context;
        },
      },
    };
  },

  mounted() {
    if (isBrowser()) {
      window.addEventListener("message", this.processMessage); // TODO: run this when content is defined
      // track('impression', {
      //   contentId: this.content!.id,
      // });
    }
  },

  computed: {
    useContent() {
      return this.overrideContent || this.content;
    },
  },

  methods: {
    processMessage(event) {
      const { data } = event;

      if (data) {
        switch (data.type) {
          case "builder.contentUpdate": {
            const key =
              data.data.key ||
              data.data.alias ||
              data.data.entry ||
              data.data.modelName;
            const contentData = data.data.data; // oof

            if (key === this.model) {
              this.overrideContent = contentData;
            }

            break;
          }

          case "builder.patchUpdates": {
            // TODO
            break;
          }
        }
      }
    },
  },
};
</script>
