<template>
  <div
    v-if="useContent"
    @click="
      track('click', {
        contentId: useContent.id,
      })
    "
    :data-builder-content-id="(useContent && useContent.id)"
  >
    <render-styles
      v-if="(((useContent && useContent.data) && (useContent && useContent.data).cssCode) || (((useContent && useContent.data) && (useContent && useContent.data).customFonts) && ((useContent && useContent.data) && (useContent && useContent.data).customFonts).length)) && TARGET !== 'reactNative'"
      :cssCode="useContent.data.cssCode"
      :customFonts="useContent.data.customFonts"
    ></render-styles>

    <render-blocks :blocks="((useContent && useContent.data) && (useContent && useContent.data).blocks)"></render-blocks>
  </div>
</template>
<script>
import { isBrowser } from "../../functions/is-browser";
import BuilderContext from "../../context/builder.context";
import { track } from "../../functions/track";
import { isEditing } from "../../functions/is-editing";
import { isPreviewing } from "../../functions/is-previewing";
import { previewingModelName } from "../../functions/previewing-model-name";
import { getContent } from "../../functions/get-content";
import {
  convertSearchParamsToQueryObject,
  getBuilderSearchParams,
} from "../../functions/get-builder-search-params";
import RenderBlocks from "../render-blocks";
import { evaluate } from "../../functions/evaluate";
import { getFetch } from "../../functions/get-fetch";
import { TARGET } from "../../constants/target";
import RenderStyles from "./components/render-styles";

export default {
  name: "render-content",
  components: {
    "render-styles": async () => RenderStyles,
    "render-blocks": async () => RenderBlocks,
  },
  props: ["content", "data", "model", "apiKey"],

  data: () => ({
    overrideContent: null,
    update: 0,
    overrideState: {},
    track,
    TARGET,
  }),

  provide() {
    const _this = this;
    return {
      BuilderContext: {
        get content() {
          return _this.useContent;
        },
        get state() {
          return _this.contentState;
        },
        get context() {
          return _this.context;
        },
        get apiKey() {
          return _this.apiKey;
        },
      },
    };
  },

  mounted() {
    if (isBrowser()) {
      if (isEditing()) {
        window.addEventListener("message", this.processMessage);
        window.addEventListener(
          "builder:component:stateChangeListenerActivated",
          this.emitStateUpdate
        );
      }

      if (this.useContent) {
        track("impression", {
          contentId: this.useContent.id,
        });
      } // override normal content in preview mode

      if (isPreviewing()) {
        if (this.model && previewingModelName() === this.model) {
          const currentUrl = new URL(location.href);
          const previewApiKey = currentUrl.searchParams.get("apiKey");

          if (previewApiKey) {
            getContent({
              model: this.model,
              apiKey: previewApiKey,
              options: getBuilderSearchParams(
                convertSearchParamsToQueryObject(currentUrl.searchParams)
              ),
            }).then((content) => {
              if (content) {
                this.overrideContent = content;
              }
            });
          }
        }
      }

      this.evaluateJsCode();
      this.runHttpRequests();
      this.emitStateUpdate();
    }
  },

  watch: {
    onUpdateHook0() {
      this.evaluateJsCode();
    },
    onUpdateHook1() {
      this.runHttpRequests();
    },
    onUpdateHook2() {
      this.emitStateUpdate();
    },
  },
  unmounted() {
    if (isBrowser()) {
      window.removeEventListener("message", this.processMessage);
      window.removeEventListener(
        "builder:component:stateChangeListenerActivated",
        this.emitStateUpdate
      );
    }
  },

  computed: {
    useContent() {
      const mergedContent = {
        ...this.content,
        ...this.overrideContent,
        data: {
          ...this.content?.data,
          ...this.data,
          ...this.overrideContent?.data,
        },
      };
      return mergedContent;
    },
    contentState() {
      return {
        ...this.content?.data?.state,
        ...this.data,
        ...this.overrideState,
      };
    },
    context() {
      return {};
    },
    httpReqsData() {
      return {};
    },
    onUpdateHook0() {
      return {
        0: this.useContent?.data?.jsCode,
      };
    },
    onUpdateHook1() {
      return {
        0: this.useContent?.data?.httpRequests,
      };
    },
    onUpdateHook2() {
      return {
        0: this.contentState,
      };
    },
  },

  methods: {
    processMessage(event) {
      const { data } = event;

      if (data) {
        switch (data.type) {
          case "builder.contentUpdate": {
            const messageContent = data.data;
            const key =
              messageContent.key ||
              messageContent.alias ||
              messageContent.entry ||
              messageContent.modelName;
            const contentData = messageContent.data;

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
    evaluateJsCode() {
      // run any dynamic JS code attached to content
      const jsCode = this.useContent?.data?.jsCode;

      if (jsCode) {
        evaluate({
          code: jsCode,
          context: this.context,
          state: this.contentState,
        });
      }
    },
    evalExpression(expression) {
      return expression.replace(/{{([^}]+)}}/g, (_match, group) =>
        evaluate({
          code: group,
          context: this.context,
          state: this.contentState,
        })
      );
    },
    handleRequest({ url, key }) {
      const fetchAndSetState = async () => {
        const response = await getFetch()(url);
        const json = await response.json();
        const newOverrideState = { ...this.overrideState, [key]: json };
        this.overrideState = newOverrideState;
      };

      fetchAndSetState();
    },
    runHttpRequests() {
      const requests = this.useContent?.data?.httpRequests ?? {};
      Object.entries(requests).forEach(([key, url]) => {
        if (url && (!this.httpReqsData[key] || isEditing())) {
          const evaluatedUrl = this.evalExpression(url);
          this.handleRequest({
            url: evaluatedUrl,
            key,
          });
        }
      });
    },
    emitStateUpdate() {
      window.dispatchEvent(
        new CustomEvent("builder:component:stateChange", {
          detail: {
            state: this.contentState,
            ref: {
              name: this.model,
            },
          },
        })
      );
    },
  },
};
</script>
