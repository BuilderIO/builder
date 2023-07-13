<template>
  <div v-if="builderContextSignal.content">
    <div
      ref="elementRef"
      @click="onClick($event)"
      :builder-content-id="builderContextSignal.content?.id"
      :builder-model="model"
      :class="_classStringToObject(classNameProp)"
      v-bind="{
        ...(TARGET === 'reactNative'
          ? {
              dataSet: {
                // currently, we can't set the actual ID here.
                // we don't need it right now, we just need to identify content divs for testing.
                'builder-content-id': '',
              },
            }
          : {}),
        ...(hideContent
          ? {
              hidden: true,
              'aria-hidden': true,
            }
          : {}),
      }"
    >
      <div v-if="isSsrAbTest">
        <render-inlined-script :scriptStr="scriptStr" :is="'script'" />
      </div>

      <div v-if="TARGET !== 'reactNative'">
        <render-content-styles
          :contentId="builderContextSignal.content?.id"
          :cssCode="builderContextSignal.content?.data?.cssCode"
          :customFonts="builderContextSignal.content?.data?.customFonts"
        ></render-content-styles>
      </div>

      <render-blocks
        :blocks="builderContextSignal.content?.data?.blocks"
        :key="forceReRenderCount"
      ></render-blocks>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { getDefaultRegisteredComponents } from '../../constants/builder-registered-components.js';
import type {
  BuilderRenderState,
  RegisteredComponent,
  RegisteredComponents,
} from '../../context/types.js';
import { evaluate } from '../../functions/evaluate.js';
import { getContent } from '../../functions/get-content/index.js';
import { fetch } from '../../functions/get-fetch.js';
import { isBrowser } from '../../functions/is-browser.js';
import { isEditing } from '../../functions/is-editing.js';
import { isPreviewing } from '../../functions/is-previewing.js';
import {
  components,
  createRegisterComponentMessage,
} from '../../functions/register-component.js';
import { _track } from '../../functions/track/index.js';
import type {
  Breakpoints,
  BuilderContent,
} from '../../types/builder-content.js';
import type { Nullable } from '../../types/typescript.js';
import RenderBlocks from '../render-blocks.vue';
import RenderContentStyles from './components/render-styles.vue';
import builderContext from '../../context/builder.context.js';
import {
  registerInsertMenu,
  setupBrowserForEditing,
} from '../../scripts/init-editing.js';
import { checkIsDefined } from '../../helpers/nullable.js';
import { getInteractionPropertiesForEvent } from '../../functions/track/interaction.js';
import type {
  RenderContentProps,
  BuilderComponentStateChange,
} from './render-content.types.js';
import {
  getContentInitialValue,
  getContextStateInitialValue,
} from './render-content.helpers.js';
import { TARGET } from '../../constants/target.js';
import { logger } from '../../helpers/logger.js';
import { getRenderContentScriptString } from '../render-content-variants/helpers.js';
import { wrapComponentRef } from './wrap-component-ref.js';
import RenderInlinedScript from '../render-inlined-script.vue';

export default defineComponent({
  name: 'render-content',
  components: {
    RenderContentStyles: RenderContentStyles,
    RenderBlocks: RenderBlocks,
    RenderInlinedScript,
  },
  props: [
    'canTrack',
    'model',
    'context',
    'apiKey',
    'content',
    'parentContentId',
    'data',
    'locale',
    'apiVersion',
    'customComponents',
    'hideContent',
    'classNameProp',
    'isSsrAbTest',
    'includeRefs',
    'enrich',
  ],

  data() {
    return {
      forceReRenderCount: 0,
      overrideContent: null,
      update: 0,
      canTrackToUse: checkIsDefined(this.canTrack) ? this.canTrack : true,
      httpReqsData: {},
      clicked: false,
      scriptStr: getRenderContentScriptString({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
        contentId: this.content?.id!,
        parentContentId: this.parentContentId!,
      }),
      builderContextSignal: {
        content: getContentInitialValue({
          content: this.content,
          data: this.data,
        }),
        localState: undefined,
        rootState: getContextStateInitialValue({
          content: this.content,
          data: this.data,
          locale: this.locale,
        }),
        rootSetState: this.contentSetState,
        context: this.context || {},
        apiKey: this.apiKey,
        apiVersion: this.apiVersion,
        registeredComponents: [
          ...getDefaultRegisteredComponents(),
          // While this `components` object is deprecated, we must maintain support for it.
          // Since users are able to override our default components, we need to make sure that we do not break such
          // existing usage.
          // This is why we spread `components` after the default Builder.io components, but before the `props.customComponents`,
          // which is the new standard way of providing custom components, and must therefore take precedence.
          ...components,
          ...(this.customComponents || []),
        ].reduce(
          (acc, { component, ...curr }) => ({
            ...acc,
            [curr.name]: {
              component:
                TARGET === 'vue3' ? wrapComponentRef(component) : component,
              ...curr,
            },
          }),
          {} as RegisteredComponents
        ),
        inheritedStyles: {},
      },
      builderContext,
      TARGET,
    };
  },

  provide() {
    const _this = this;
    return {
      [builderContext.key]: _this.builderContextSignal,
    };
  },

  mounted() {
    if (!this.apiKey) {
      logger.error(
        'No API key provided to `RenderContent` component. This can cause issues. Please provide an API key using the `apiKey` prop.'
      );
    }
    if (isBrowser()) {
      if (isEditing()) {
        this.forceReRenderCount = this.forceReRenderCount + 1;
        registerInsertMenu();
        setupBrowserForEditing({
          ...(this.locale
            ? {
                locale: this.locale,
              }
            : {}),
          ...(this.includeRefs
            ? {
                includeRefs: this.includeRefs,
              }
            : {}),
          ...(this.enrich
            ? {
                enrich: this.enrich,
              }
            : {}),
        });
        Object.values<RegisteredComponent>(
          this.builderContextSignal.registeredComponents
        ).forEach((registeredComponent) => {
          const message = createRegisterComponentMessage(registeredComponent);
          window.parent?.postMessage(message, '*');
        });
        window.addEventListener('message', this.processMessage);
        window.addEventListener(
          'builder:component:stateChangeListenerActivated',
          this.emitStateUpdate
        );
      }
      if (this.builderContextSignal.content) {
        const variationId = this.builderContextSignal.content?.testVariationId;
        const contentId = this.builderContextSignal.content?.id;
        _track({
          type: 'impression',
          canTrack: this.canTrackToUse,
          contentId,
          apiKey: this.apiKey,
          variationId: variationId !== contentId ? variationId : undefined,
        });
      }

      // override normal content in preview mode
      if (isPreviewing()) {
        const searchParams = new URL(location.href).searchParams;
        const searchParamPreviewModel = searchParams.get('builder.preview');
        const searchParamPreviewId = searchParams.get(
          `builder.preview.${searchParamPreviewModel}`
        );
        const previewApiKey =
          searchParams.get('apiKey') || searchParams.get('builder.space');

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
          getContent({
            model: this.model,
            apiKey: this.apiKey,
            apiVersion: this.apiVersion,
          }).then((content) => {
            if (content) {
              this.mergeNewContent(content);
            }
          });
        }
      }
      this.evaluateJsCode();
      this.runHttpRequests();
      this.emitStateUpdate();
    }
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
  },
  unmounted() {
    if (isBrowser()) {
      window.removeEventListener('message', this.processMessage);
      window.removeEventListener(
        'builder:component:stateChangeListenerActivated',
        this.emitStateUpdate
      );
    }
  },

  computed: {
    onUpdateHook0() {
      return {
        0: this.content,
      };
    },
    onUpdateHook1() {
      return {
        0: this.builderContextSignal.content?.data?.jsCode,
        1: this.builderContextSignal.rootState,
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
  },

  methods: {
    mergeNewContent(newContent: BuilderContent) {
      this.builderContextSignal.content = {
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
    },
    setBreakpoints(breakpoints: Breakpoints) {
      this.builderContextSignal.content = {
        ...this.builderContextSignal.content,
        meta: {
          ...this.builderContextSignal.content?.meta,
          breakpoints,
        },
      };
    },
    contentSetState(newRootState: BuilderRenderState) {
      this.builderContextSignal.rootState = newRootState;
    },
    processMessage(event: MessageEvent) {
      const { data } = event;
      if (data) {
        switch (data.type) {
          case 'builder.configureSdk': {
            const messageContent = data.data;
            const { breakpoints, contentId } = messageContent;
            if (
              !contentId ||
              contentId !== this.builderContextSignal.content?.id
            ) {
              return;
            }
            if (breakpoints) {
              this.setBreakpoints(breakpoints);
            }
            this.forceReRenderCount = this.forceReRenderCount + 1; // This is a hack to force Qwik to re-render.
            break;
          }
          case 'builder.contentUpdate': {
            const messageContent = data.data;
            const key =
              messageContent.key ||
              messageContent.alias ||
              messageContent.entry ||
              messageContent.modelName;
            const contentData = messageContent.data;
            if (key === this.model) {
              this.mergeNewContent(contentData);
              this.forceReRenderCount = this.forceReRenderCount + 1; // This is a hack to force Qwik to re-render.
            }

            break;
          }
          case 'builder.patchUpdates': {
            // TODO
            break;
          }
        }
      }
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
          rootSetState: this.contentSetState,
        });
      }
    },
    onClick(event: any) {
      if (this.builderContextSignal.content) {
        const variationId = this.builderContextSignal.content?.testVariationId;
        const contentId = this.builderContextSignal.content?.id;
        _track({
          type: 'click',
          canTrack: this.canTrackToUse,
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
    evalExpression(expression: string) {
      return expression.replace(/{{([^}]+)}}/g, (_match, group) =>
        evaluate({
          code: group,
          context: this.context || {},
          localState: undefined,
          rootState: this.builderContextSignal.rootState,
          rootSetState: this.contentSetState,
        })
      );
    },
    handleRequest({ url, key }: { key: string; url: string }) {
      fetch(url)
        .then((response) => response.json())
        .then((json) => {
          const newState = {
            ...this.builderContextSignal.rootState,
            [key]: json,
          };
          this.contentSetState(newState);
        })
        .catch((err) => {
          console.error('error fetching dynamic data', url, err);
        });
    },
    runHttpRequests() {
      const requests: {
        [key: string]: string;
      } = this.builderContextSignal.content?.data?.httpRequests ?? {};
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
      if (isEditing()) {
        window.dispatchEvent(
          new CustomEvent<BuilderComponentStateChange>(
            'builder:component:stateChange',
            {
              detail: {
                state: this.builderContextSignal.rootState,
                ref: {
                  name: this.model,
                },
              },
            }
          )
        );
      }
    },
    _classStringToObject(str: string) {
      const obj: Record<string, boolean> = {};
      if (typeof str !== 'string') {
        return obj;
      }
      const classNames = str.trim().split(/\s+/);
      for (const name of classNames) {
        obj[name] = true;
      }
      return obj;
    },
  },
});
</script>
