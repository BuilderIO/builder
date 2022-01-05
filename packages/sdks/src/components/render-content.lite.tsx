import {
  onMount,
  onUnMount,
  setContext,
  useState,
  onCreate,
  Show,
} from '@builder.io/mitosis';
import { isBrowser } from '../functions/is-browser';
import { BuilderContent } from '../types/builder-content';
import RenderBlock from './render-block.lite';
import BuilderContext from '../context/builder.context.lite';
import { track } from '../functions/track';
import { ifTarget } from '../functions/if-target';
import { onChange } from '../functions/on-change';
import { isReactNative } from '../functions/is-react-native';
import { isEditing } from '../functions/is-editing';
import { isPreviewing } from '../functions/is-previewing';
import { previewingModelName } from '../functions/previewing-model-name';
import { getContent } from '../functions/get-content';

export type RenderContentProps = {
  content?: BuilderContent;
  model?: string;
  data?: { [key: string]: any };
  context?: { [key: string]: any };
};

export default function RenderContent(props: RenderContentProps) {
  const state = useState({
    get useContent(): any {
      return state.overrideContent || props.content;
    },
    update: 0,
    state: {},
    context: {},
    overrideContent: null as BuilderContent | null,
    getCssFromFont(font: any, data?: any) {
      // TODO: compute what font sizes are used and only load those.......
      const family =
        font.family +
        (font.kind && !font.kind.includes('#') ? ', ' + font.kind : '');
      const name = family.split(',')[0];
      const url = font.fileUrl
        ? font.fileUrl
        : font.files && font.files.regular;
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
          }
          // TODO: maybe limit number loaded
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

    getFontCss(data?: any) {
      // TODO: flag for this
      // if (!this.builder.allowCustomFonts) {
      //   return '';
      // }
      // TODO: separate internal data from external
      return (
        (data?.customFonts &&
          data.customFonts.length &&
          data.customFonts
            .map((font: any) => this.getCssFromFont(font, data))
            .join(' ')) ||
        ''
      );
    },

    processMessage(event: MessageEvent): void {
      const { data } = event;
      if (data) {
        switch (data.type) {
          case 'builder.contentUpdate': {
            const key =
              data.data.key ||
              data.data.alias ||
              data.data.entry ||
              data.data.modelName;

            const contentData = data.data.data; // oof

            if (key === props.model) {
              state.overrideContent = contentData;
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
  });

  onCreate(() => {
    state.state = ifTarget(
      // The reactive targets
      ['vue', 'solid'],
      () => ({}),
      () =>
        onChange({}, () => {
          state.update = state.update + 1;
        })
    );

    // TODO: inherit context here too
  });

  setContext(BuilderContext, {
    get content() {
      return state.useContent;
    },
    get state() {
      return state.state;
    },
    get context() {
      return state.context;
    },
  });

  onMount(() => {
    if (isBrowser()) {
      if (isEditing()) {
        window.addEventListener('message', state.processMessage);
      }
      if (state.useContent && !isEditing()) {
        track('impression', {
          contentId: state.useContent!.id,
        });
      }
      if (isPreviewing()) {
        if (props.model && previewingModelName() === props.model) {
          const options: Record<string, any> = {};
          const currentUrl = new URL(location.href);
          const apiKey = currentUrl.searchParams.get('apiKey');
          if (apiKey) {
            const builderPrefix = 'builder.';
            currentUrl.searchParams.forEach((value, key) => {
              if (key.startsWith(builderPrefix)) {
                options[key.replace(builderPrefix, '')] = value;
              }
            });

            // TODO: need access to API key
            getContent({
              model: props.model,
              apiKey,
              options,
            }).then((content) => {
              if (content) {
                state.overrideContent = content;
              }
            });
          }
          // TODO: fetch content and override. Forward all builder.* params
        }
      }
    }
  });

  onUnMount(() => {
    if (isBrowser()) {
      window.removeEventListener('message', state.processMessage);
    }
  });

  // TODO: `else` message for when there is no content passed, or maybe a console.log
  return (
    <Show when={state.useContent}>
      <div
        onClick={(e) => {
          if (!isEditing()) {
            track('click', {
              contentId: state.useContent!.id,
            });
          }
        }}
        data-builder-content-id={state.useContent?.id}
      >
        {(state.useContent?.data?.cssCode ||
          (state.useContent?.data?.customFonts &&
            state.useContent?.data?.customFonts.length)) &&
          !isReactNative() && (
            <style>
              {state.useContent.data.cssCode}
              {state.getFontCss(state.useContent.data)}
            </style>
          )}
        {state.useContent?.data?.blocks?.map((block: any) => (
          <RenderBlock key={block.id} block={block} />
        ))}
      </div>
    </Show>
  );
}
