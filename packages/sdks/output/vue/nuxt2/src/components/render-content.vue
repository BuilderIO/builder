<template>
  <div
    v-if="useContent"
    @click="
      track('click', {
        contentId: useContent.id,
      })
    "
    :data-builder-content-id="useContent && useContent.id"
  >
    <component
      v-if="
        ((useContent &&
          useContent.data &&
          (useContent && useContent.data).cssCode) ||
          (useContent &&
            useContent.data &&
            (useContent && useContent.data).customFonts &&
            (
              useContent &&
              useContent.data &&
              (useContent && useContent.data).customFonts
            ).length)) &&
        !isReactNative()
      "
      :is="style"
    >
      {{ useContent.data.cssCode }}
      {{ getFontCss(useContent.data) }}
    </component>

    <render-blocks
      :blocks="
        useContent && useContent.data && (useContent && useContent.data).blocks
      "
    ></render-blocks>
  </div>
</template>
<script>
import { isBrowser } from '../functions/is-browser';
import BuilderContext from '../context/builder.context';
import { track } from '../functions/track';
import { isReactNative } from '../functions/is-react-native';
import { isEditing } from '../functions/is-editing';
import { isPreviewing } from '../functions/is-previewing';
import { previewingModelName } from '../functions/previewing-model-name';
import { getContent } from '../functions/get-content';
import {
  convertSearchParamsToQueryObject,
  getBuilderSearchParams,
} from '../functions/get-builder-search-params';
import RenderBlocks from './render-blocks';
import { evaluate } from '../functions/evaluate';
import { getFetch } from '../functions/get-fetch';
import { onChange } from '../functions/on-change';

export default {
  name: 'render-content',
  components: { 'render-blocks': async () => RenderBlocks },
  props: ['content', 'model', 'apiKey'],

  data: () => ({ update: 0, overrideContent: null, track, isReactNative }),

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
        get apiKey() {
          return _this.apiKey;
        },
      },
    };
  },

  mounted() {
    if (isBrowser()) {
      if (isEditing()) {
        window.addEventListener('message', this.processMessage);
        window.addEventListener(
          'builder:component:stateChangeListenerActivated',
          this.emitStateUpdate
        );
      }

      if (this.useContent) {
        track('impression', {
          contentId: this.useContent.id,
        });
      } // override normal content in preview mode

      if (isPreviewing()) {
        if (this.model && previewingModelName() === this.model) {
          const currentUrl = new URL(location.href);
          const previewApiKey = currentUrl.searchParams.get('apiKey');

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
      window.removeEventListener('message', this.processMessage);
      window.removeEventListener(
        'builder:component:stateChangeListenerActivated',
        this.emitStateUpdate
      );
    }
  },

  computed: {
    useContent() {
      return this.overrideContent || this.content;
    },
    state() {
      return this.content?.data?.state || {};
    },
    context() {
      return {};
    },
    httpReqsData() {
      return {};
    },
    onUpdateHook0() {
      return `${this.useContent?.data?.jsCode}`;
    },
    onUpdateHook1() {
      return `${this.useContent?.data?.httpRequests}`;
    },
    onUpdateHook2() {
      return `${this.state}`;
    },
  },

  methods: {
    getCssFromFont(font, data) {
      // TODO: compute what font sizes are used and only load those.......
      const family =
        font.family +
        (font.kind && !font.kind.includes('#') ? ', ' + font.kind : '');
      const name = family.split(',')[0];
      const url = font.fileUrl ?? font?.files?.regular;
      let str = '';

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
        data?.customFonts
          ?.map((font) => this.getCssFromFont(font, data))
          ?.join(' ') || ''
      );
    },
    processMessage(event) {
      const { data } = event;

      if (data) {
        switch (data.type) {
          case 'builder.contentUpdate': {
            const messageContent = data.data;
            const key =
              messageContent.key ||
              messageContent.alias ||
              messageContent.entry ||
              messageContent.modelName;
            const contentData = messageContent.data;
            console.log('content update', key, contentData);

            if (key === this.model) {
              this.overrideContent = contentData;
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
      const jsCode = this.useContent?.data?.jsCode;

      if (jsCode) {
        evaluate({
          code: jsCode,
          context: this.context,
          state: this.state,
        });
      }
    },
    evalExpression(expression) {
      return expression.replace(/{{([^}]+)}}/g, (_match, group) =>
        evaluate({
          code: group,
          context: this.context,
          state: this.state,
        })
      );
    },
    handleRequest({ url, key }) {
      console.log('handleReq');

      const fetchAndSetState = async () => {
        console.log('fetch: ', {
          url,
          key,
        });
        const response = await getFetch()(url);
        const json = await response.json();
        this.state[key] = json;
      };

      fetchAndSetState();
    },
    runHttpRequests() {
      const requests = this.useContent?.data?.httpRequests ?? {};
      console.log('about to run HTTP requests', requests.toString());
      Object.entries(requests).forEach(([key, url]) => {
        if (url && (!this.httpReqsData[key] || isEditing())) {
          const evaluatedUrl = this.evalExpression(url);

          if (isBrowser()) {
            this.handleRequest({
              url: evaluatedUrl,
              key,
            });
          } else {
          }
        }
      });
    },
    emitStateUpdate() {
      window.dispatchEvent(
        new CustomEvent('builder:component:stateChange', {
          detail: {
            state: this.state,
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
