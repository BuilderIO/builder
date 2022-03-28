import * as React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { useState, useContext, useEffect } from 'react';
import { isBrowser } from '../functions/is-browser';
import BuilderContext from '../context/builder.context.lite';
import { track } from '../functions/track';
import { ifTarget } from '../functions/if-target';
import { onChange } from '../functions/on-change';
import { isReactNative } from '../functions/is-react-native';
import { isEditing } from '../functions/is-editing';
import { isPreviewing } from '../functions/is-previewing';
import { previewingModelName } from '../functions/previewing-model-name';
import { getContent } from '../functions/get-content';
import {
  convertSearchParamsToQueryObject,
  getBuilderSearchParams,
} from '../functions/get-builder-search-params';
import RenderBlocks from './render-blocks.lite';
import { evaluate } from '../functions/evaluate';

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
    // if (!builder.allowCustomFonts) {
    //   return '';
    // }
    // TODO: separate internal data from external
    return (
      data?.customFonts?.map((font) => getCssFromFont(font, data))?.join(' ') ||
      ''
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

  function evaluateJsCode() {
    // run any dynamic JS code attached to content
    const jsCode = useContent?.()?.data?.jsCode;

    if (jsCode) {
      evaluate({
        code: jsCode,
        context: context,
        state: state,
      });
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
      } // override normal content in preview mode

      if (isPreviewing()) {
        if (props.model && previewingModelName() === props.model) {
          const currentUrl = new URL(location.href);
          const previewApiKey = currentUrl.searchParams.get('apiKey');

          if (previewApiKey) {
            getContent({
              model: props.model,
              apiKey: previewApiKey,
              options: getBuilderSearchParams(
                convertSearchParamsToQueryObject(currentUrl.searchParams)
              ),
            }).then((content) => {
              if (content) {
                setOverrideContent(content);
              }
            });
          }
        }
      }

      evaluateJsCode();
    }
  }, []);

  useEffect(() => {
    evaluateJsCode();
  }, [useContent?.()?.data?.jsCode]);

  useEffect(() => {
    return () => {
      if (isBrowser()) {
        window.removeEventListener('message', processMessage);
      }
    };
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

        get apiKey() {
          return props.apiKey;
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

            <RenderBlocks blocks={useContent?.()?.data?.blocks} />
          </View>
        </>
      ) : null}
    </BuilderContext.Provider>
  );
}
