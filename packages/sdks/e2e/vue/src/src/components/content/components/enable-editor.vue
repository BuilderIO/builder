<template>
  <template v-if="builderContextSignal.content">
    <component
      ref="elementRef"
      :onClick="(event) => onClick(event)"
      :builder-content-id="builderContextSignal.content?.id"
      :builder-model="model"
      :class="getWrapperClassName(content?.testVariationId || content?.id)"
      :is="ContentWrapper"
      :onIniteditingbldr="(event) => elementRef_onIniteditingbldr(event)"
      :onInitpreviewingbldr="(event) => elementRef_onInitpreviewingbldr(event)"
      v-bind="{ ...{}, ...{}, ...showContentProps, ...contentWrapperProps }"
      ><slot
    /></component>
  </template>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import builderContext from "../../../context/builder.context";
import type { BuilderContextInterface } from "../../../context/types";
import { evaluate } from "../../../functions/evaluate/index";
import { fastClone } from "../../../functions/fast-clone";
import { fetchOneEntry } from "../../../functions/get-content/index";
import { fetch } from "../../../functions/get-fetch";
import { isBrowser } from "../../../functions/is-browser";
import { isEditing } from "../../../functions/is-editing";
import { isPreviewing } from "../../../functions/is-previewing";
import { createRegisterComponentMessage } from "../../../functions/register-component";
import { _track } from "../../../functions/track/index";
import { getInteractionPropertiesForEvent } from "../../../functions/track/interaction";
import { getDefaultCanTrack } from "../../../helpers/canTrack";
import { logger } from "../../../helpers/logger";
import { postPreviewContent } from "../../../helpers/preview-lru-cache/set";
import { createEditorListener } from "../../../helpers/subscribe-to-editor";
import {
  registerInsertMenu,
  setupBrowserForEditing,
} from "../../../scripts/init-editing";
import type { BuilderContent } from "../../../types/builder-content";
import type { ComponentInfo } from "../../../types/components";
import type { Dictionary } from "../../../types/typescript";
import { triggerAnimation } from "../../block/animator";
import DynamicDiv from "../../dynamic-div.vue";
import type {
  BuilderComponentStateChange,
  ContentProps,
} from "../content.types";
import { getWrapperClassName } from "./styles.helpers";

type BuilderEditorProps = Omit<
  ContentProps,
  | "customComponents"
  | "apiVersion"
  | "isSsrAbTest"
  | "blocksWrapper"
  | "blocksWrapperProps"
  | "isNestedRender"
  | "linkComponent"
> & {
  builderContextSignal: BuilderContextInterface;
  setBuilderContextSignal?: (signal: any) => any;
  children?: any;
};

export default defineComponent({
  name: "enable-editor",
  components: { DynamicDiv: DynamicDiv },
  props: [
    "builderContextSignal",
    "canTrack",
    "apiKey",
    "locale",
    "enrich",
    "trustedHosts",
    "model",
    "content",
    "data",
    "showContent",
    "contentWrapper",
    "context",
    "contentWrapperProps",
  ],

  data() {
    return {
      ContentWrapper: this.contentWrapper || "div",
      httpReqsData: {},
      httpReqsPending: {},
      clicked: false,
      builderContext,
      getWrapperClassName,
    };
  },

  provide() {
    const _this = this;
    return {
      [builderContext.key]: _this.builderContextSignal,
    };
  },

  mounted() {
    const onMountHook_0 = () => {
      if (isBrowser()) {
        if (isEditing()) {
          if (this.$refs.elementRef) {
            this.$refs.elementRef.dispatchEvent(
              new CustomEvent("initeditingbldr")
            );
          }
        }
        const shouldTrackImpression =
          this.builderContextSignal.content &&
          getDefaultCanTrack(this.canTrack);
        if (shouldTrackImpression) {
          const variationId =
            this.builderContextSignal.content?.testVariationId;
          const contentId = this.builderContextSignal.content?.id;
          const apiKeyProp = this.apiKey;
          _track({
            type: "impression",
            canTrack: true,
            contentId,
            apiKey: apiKeyProp!,
            variationId: variationId !== contentId ? variationId : undefined,
          });
        }

        /**
         * Override normal content in preview mode.
         * We ignore this when editing, since the edited content is already being sent from the editor via post messages.
         */
        if (isPreviewing() && !isEditing()) {
          if (this.$refs.elementRef) {
            this.$refs.elementRef.dispatchEvent(
              new CustomEvent("initpreviewingbldr")
            );
          }
        }
      }
    };
    onMountHook_0();
    const onMountHook_1 = () => {
      if (!this.apiKey) {
        logger.error(
          "No API key provided to `Content` component. This can cause issues. Please provide an API key using the `apiKey` prop."
        );
      }
      this.evaluateJsCode();
      this.runHttpRequests();
      this.emitStateUpdate();
    };
    onMountHook_1();
  },

  watch: {
    onUpdateHook0: {
      handler() {
        if (this.content) {
          this.mergeNewContent(this.content);
        }
      },
      immediate: true,
    },
    onUpdateHook1: {
      handler() {
        this.evaluateJsCode();
      },
      immediate: true,
    },
    onUpdateHook2: {
      handler() {
        this.runHttpRequests();
      },
      immediate: true,
    },
    onUpdateHook3: {
      handler() {
        this.emitStateUpdate();
      },
      immediate: true,
    },
    onUpdateHook4: {
      handler() {
        if (this.data) {
          this.mergeNewRootState(this.data);
        }
      },
      immediate: true,
    },
    onUpdateHook5: {
      handler() {
        if (this.locale) {
          this.mergeNewRootState({
            locale: this.locale,
          });
        }
      },
      immediate: true,
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
    showContentProps() {
      return this.showContent
        ? {}
        : {
            hidden: true,
            "aria-hidden": true,
          };
    },
    onUpdateHook0() {
      return {
        0: this.content,
      };
    },
    onUpdateHook1() {
      return {
        0: this.builderContextSignal.content?.data?.jsCode,
      };
    },
    onUpdateHook2() {
      return {
        0: this.builderContextSignal.content?.data?.httpRequests,
      };
    },
    onUpdateHook3() {
      return {
        0: this.builderContextSignal.rootState,
      };
    },
    onUpdateHook4() {
      return {
        0: this.data,
      };
    },
    onUpdateHook5() {
      return {
        0: this.locale,
      };
    },
  },

  methods: {
    mergeNewRootState(newData: Dictionary<any>) {
      const combinedState = {
        ...this.builderContextSignal.rootState,
        ...newData,
      };
      if (this.builderContextSignal.rootSetState) {
        this.builderContextSignal.rootSetState?.(combinedState);
      } else {
        this.builderContextSignal.rootState = combinedState;
      }
    },
    mergeNewContent(newContent: BuilderContent) {
      const newContentValue = {
        ...this.builderContextSignal.content,
        ...newContent,
        data: {
          ...this.builderContextSignal.content?.data,
          ...newContent?.data,
        },
        meta: {
          ...this.builderContextSignal.content?.meta,
          ...newContent?.meta,
          breakpoints:
            newContent?.meta?.breakpoints ||
            this.builderContextSignal.content?.meta?.breakpoints,
        },
      };
      this.builderContextSignal.content = newContentValue;
    },
    processMessage(event: MessageEvent) {
      return createEditorListener({
        model: this.model,
        trustedHosts: this.trustedHosts,
        callbacks: {
          configureSdk: (messageContent) => {
            const { breakpoints, contentId } = messageContent;
            if (
              !contentId ||
              contentId !== this.builderContextSignal.content?.id
            ) {
              return;
            }
            if (breakpoints) {
              this.mergeNewContent({
                meta: {
                  breakpoints,
                },
              });
            }
          },
          animation: (animation) => {
            triggerAnimation(animation);
          },
          contentUpdate: (newContent) => {
            this.mergeNewContent(newContent);
          },
        },
      })(event);
    },
    evaluateJsCode() {
      // run any dynamic JS code attached to content
      const jsCode = this.builderContextSignal.content?.data?.jsCode;
      if (jsCode) {
        evaluate({
          code: jsCode,
          context: this.context || {},
          localState: undefined,
          rootState: this.builderContextSignal.rootState,
          rootSetState: this.builderContextSignal.rootSetState,
          /**
           * We don't want to cache the result of the JS code, since it's arbitrary side effect code.
           */
          enableCache: false,
        });
      }
    },
    onClick(event: any) {
      if (this.builderContextSignal.content) {
        const variationId = this.builderContextSignal.content?.testVariationId;
        const contentId = this.builderContextSignal.content?.id;
        _track({
          type: "click",
          canTrack: getDefaultCanTrack(this.canTrack),
          contentId,
          apiKey: this.apiKey,
          variationId: variationId !== contentId ? variationId : undefined,
          ...getInteractionPropertiesForEvent(event),
          unique: !this.clicked,
        });
      }
      if (!this.clicked) {
        this.clicked = true;
      }
    },
    runHttpRequests() {
      const requests: {
        [key: string]: string;
      } = this.builderContextSignal.content?.data?.httpRequests ?? {};
      Object.entries(requests).forEach(([key, url]) => {
        if (!url) return;

        // request already in progress
        if (this.httpReqsPending[key]) return;

        // request already completed, and not in edit mode
        if (this.httpReqsData[key] && !isEditing()) return;
        this.httpReqsPending[key] = true;
        const evaluatedUrl = url.replace(/{{([^}]+)}}/g, (_match, group) =>
          String(
            evaluate({
              code: group,
              context: this.context || {},
              localState: undefined,
              rootState: this.builderContextSignal.rootState,
              rootSetState: this.builderContextSignal.rootSetState,
              enableCache: true,
            })
          )
        );
        fetch(evaluatedUrl)
          .then((response) => response.json())
          .then((json) => {
            this.mergeNewRootState({
              [key]: json,
            });
            this.httpReqsData[key] = true;
          })
          .catch((err) => {
            console.error("error fetching dynamic data", url, err);
          })
          .finally(() => {
            this.httpReqsPending[key] = false;
          });
      });
    },
    emitStateUpdate() {
      if (isEditing()) {
        window.dispatchEvent(
          new CustomEvent<BuilderComponentStateChange>(
            "builder:component:stateChange",
            {
              detail: {
                state: fastClone(this.builderContextSignal.rootState),
                ref: {
                  name: this.model,
                },
              },
            }
          )
        );
      }
    },
    elementRef_onIniteditingbldr(event) {
      window.addEventListener("message", this.processMessage);
      registerInsertMenu();
      setupBrowserForEditing({
        ...(this.locale
          ? {
              locale: this.locale,
            }
          : {}),
        ...(this.enrich
          ? {
              enrich: this.enrich,
            }
          : {}),
        ...(this.trustedHosts
          ? {
              trustedHosts: this.trustedHosts,
            }
          : {}),
      });
      Object.values<ComponentInfo>(
        this.builderContextSignal.componentInfos
      ).forEach((registeredComponent) => {
        const message = createRegisterComponentMessage(registeredComponent);
        window.parent?.postMessage(message, "*");
      });
      window.addEventListener(
        "builder:component:stateChangeListenerActivated",
        this.emitStateUpdate
      );
    },
    elementRef_onInitpreviewingbldr(event) {
      const searchParams = new URL(location.href).searchParams;
      const searchParamPreviewModel = searchParams.get("builder.preview");
      const searchParamPreviewId = searchParams.get(
        `builder.overrides.${searchParamPreviewModel}`
      );
      const previewApiKey =
        searchParams.get("apiKey") || searchParams.get("builder.space");

      /**
       * Make sure that:
       * - the preview model name is the same as the one we're rendering, since there can be multiple models rendered
       *  at the same time, e.g. header/page/footer.
       * - the API key is the same, since we don't want to preview content from other organizations.
       * - if there is content, that the preview ID is the same as that of the one we receive.
       *
       * TO-DO: should we only update the state when there is a change?
       **/
      if (
        searchParamPreviewModel === this.model &&
        previewApiKey === this.apiKey &&
        (!this.content || searchParamPreviewId === this.content.id)
      ) {
        fetchOneEntry({
          model: this.model,
          apiKey: this.apiKey,
          apiVersion: this.builderContextSignal.apiVersion,
        }).then((content) => {
          if (content) {
            this.mergeNewContent(content);
          }
        });
      }
    },
  },
});
</script>