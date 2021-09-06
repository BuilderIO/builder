<template>
  <template v-if="useContent">
    <div
      @click="
        if (!isEditing()) {
          track('click', {
            contentId: useContent.id,
          });
        }
      "
      :data-builder-content-id="useContent?.id"
    >
      <template
        v-if="
          (useContent?.data?.cssCode ||
            (useContent?.data?.customFonts &&
              useContent?.data?.customFonts.length)) &&
          !isReactNative()
        "
      >
        <component is="style">
          {{ useContent.data.cssCode }}
          {{ getFontCss(useContent.data) }}
        </component>
      </template>
      <template
        :key="block.id"
        v-for="(block, index) in useContent?.data?.blocks"
      >
        <render-block :block="block"></render-block>
      </template>
    </div>
  </template>
</template>
<script>
import { isBrowser } from "../functions/is-browser";
import RenderBlock from "./render-block.lite";
import BuilderContext from "../context/builder.context.lite";
import { track } from "../functions/track";
import { ifTarget } from "../functions/if-target";
import { onChange } from "../functions/on-change";
import { isReactNative } from "../functions/is-react-native";
import { isEditing } from "../functions/is-editing";
import { isPreviewing } from "../functions/is-previewing";
import { previewingModelName } from "../functions/previewing-model-name";
import { getContent } from "../functions/get-content";

export default {
  name: "render-content",
  components: { "render-block": async () => RenderBlock },
  props: ["content", "model"],

  data: () => ({
    update: 0,
    state: {},
    context: {},
    overrideContent: null,
    track,
    isReactNative,
    isEditing,
  }),

  provide() {
    const _this = this;
    return {
      BuilderContext: {
        get content() {
          return _this.useContent;
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
      if (isEditing()) {
        window.addEventListener("message", this.processMessage);
      }

      if (this.useContent && !isEditing()) {
        track("impression", {
          contentId: this.useContent.id,
        });
      }

      if (isPreviewing()) {
        if (this.model && previewingModelName() === this.model) {
          const options = {};
          const currentUrl = new URL(location.href);
          const apiKey = currentUrl.searchParams.get("apiKey");

          if (apiKey) {
            const builderPrefix = "builder.";
            currentUrl.searchParams.forEach((value, key) => {
              if (key.startsWith(builderPrefix)) {
                options[key.replace(builderPrefix, "")] = value;
              }
            }); // TODO: need access to API key

            getContent({
              model: this.model,
              apiKey,
              options,
            }).then((content) => {
              if (content) {
                this.overrideContent = content;
              }
            });
          } // TODO: fetch content and override. Forward all builder.* params
        }
      }
    }
  },

  computed: {
    useContent() {
      return this.overrideContent || this.content;
    },
  },

  methods: {
    getCssFromFont(font, data) {
      // TODO: compute what font sizes are used and only load those.......
      const family =
        font.family +
        (font.kind && !font.kind.includes("#") ? ", " + font.kind : "");
      const name = family.split(",")[0];
      const url = font.fileUrl
        ? font.fileUrl
        : font.files && font.files.regular;
      let str = "";

      if (url && family && name) {
        str += `
@font-face {
  font-family: "${family}";
  src: local("${name}"), url('${url}') format('woff2');
  font-display: fallback;
  font-weight: 400;
}
        `.trim();
      }

      if (font.files) {
        for (const weight in font.files) {
          const isNumber = String(Number(weight)) === weight;

          if (!isNumber) {
            continue;
          } // TODO: maybe limit number loaded

          const weightUrl = font.files[weight];

          if (weightUrl && weightUrl !== url) {
            str += `
@font-face {
  font-family: "${family}";
  src: url('${weightUrl}') format('woff2');
  font-display: fallback;
  font-weight: ${weight};
}
          `.trim();
          }
        }
      }

      return str;
    },
    getFontCss(data) {
      // TODO: flag for this
      // if (!this.builder.allowCustomFonts) {
      //   return '';
      // }
      // TODO: separate internal data from external
      return (
        (data?.customFonts &&
          data.customFonts.length &&
          data.customFonts
            .map((font) => this.getCssFromFont(font, data))
            .join(" ")) ||
        ""
      );
    },
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
