import * as React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { useState, useContext, useEffect } from 'react';
import { isBrowser } from '../functions/is-browser';
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

export default function RenderContent(props) {
  function useContent() {
    return overrideContent || props.content;
  }

  const [update, setUpdate] = useState(() => 0);

  const [state, setState] = useState(() => ({}));

  const [context, setContext] = useState(() => ({}));

  const [overrideContent, setOverrideContent] = useState(() => null);

  function getCssFromFont(font, data) {
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
  }

  function getFontCss(data) {
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
  }

  function processMessage(event) {
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
            setOverrideContent(contentData);
          }

          break;
        }

        case 'builder.patchUpdates': {
          // TODO
          break;
        }
      }
    }
  }

  useEffect(() => {
    if (isBrowser()) {
      if (isEditing()) {
        window.addEventListener('message', processMessage);
      }

      if (useContent() && !isEditing()) {
        track('impression', {
          contentId: useContent().id,
        });
      }

      if (isPreviewing()) {
        if (props.model && previewingModelName() === props.model) {
          const options = {};
          const currentUrl = new URL(location.href);
          const apiKey = currentUrl.searchParams.get('apiKey');

          if (apiKey) {
            const builderPrefix = 'builder.';
            currentUrl.searchParams.forEach((value, key) => {
              if (key.startsWith(builderPrefix)) {
                options[key.replace(builderPrefix, '')] = value;
              }
            }); // TODO: need access to API key

            getContent({
              model: props.model,
              apiKey,
              options,
            }).then((content) => {
              if (content) {
                setOverrideContent(content);
              }
            });
          } // TODO: fetch content and override. Forward all builder.* params
        }
      }
    }
  }, []);

  return (
    <BuilderContext.Provider
      value={{
        get content() {
          return useContent();
        },

        get state() {
          return state;
        },

        get context() {
          return context;
        },
      }}
    >
      {useContent() ? (
        <>
          <View
            onClick={(event) => {
              if (!isEditing()) {
                track('click', {
                  contentId: useContent().id,
                });
              }
            }}
            data-builder-content-id={useContent?.()?.id}
          >
            {(useContent?.()?.data?.cssCode ||
              useContent?.()?.data?.customFonts?.length) &&
            !isReactNative() ? (
              <View>
                <Text>{useContent().data.cssCode}</Text>

                <Text>{getFontCss(useContent().data)}</Text>
              </View>
            ) : null}

            {useContent?.()?.data?.blocks?.map((block) => (
              <RenderBlock key={block.id} block={block} />
            ))}
          </View>
        </>
      ) : null}
    </BuilderContext.Provider>
  );
}
