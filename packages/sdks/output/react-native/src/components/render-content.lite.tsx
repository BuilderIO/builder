import * as React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { useState, useContext, useEffect } from 'react';
import { isBrowser } from '../functions/is-browser';
import BuilderContext from '../context/builder.context.lite';
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
import RenderBlocks from './render-blocks.lite';
import { evaluate } from '../functions/evaluate';
import { getFetch } from '../functions/get-fetch';
import { onChange } from '../functions/on-change';
import { ifTarget } from '../functions/if-target';

export default function RenderContent(props) {
  function useContent() {
    const mergedContent = {
      ...props.content,
      ...overrideContent,
      data: { ...props.content?.data, ...overrideContent?.data },
    };
    return mergedContent;
  }

  const [overrideContent, setOverrideContent] = useState(() => null);

  const [update, setUpdate] = useState(() => 0);

  const [overrideState, setOverrideState] = useState(() => ({}));

  function state() {
    return { ...props.content?.data?.state, ...overrideState };
  }

  function context() {
    return {};
  }

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
          const messageContent = data.data;
          const key =
            messageContent.key ||
            messageContent.alias ||
            messageContent.entry ||
            messageContent.modelName;
          const contentData = messageContent.data;

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
        context: context(),
        state: state(),
      });
    }
  }

  function httpReqsData() {
    return {};
  }

  function evalExpression(expression) {
    return expression.replace(/{{([^}]+)}}/g, (_match, group) =>
      evaluate({
        code: group,
        context: context(),
        state: state(),
      })
    );
  }

  function handleRequest({ url, key }) {
    const fetchAndSetState = async () => {
      const response = await getFetch()(url);
      const json = await response.json();
      const newOverrideState = { ...overrideState, [key]: json };
      setOverrideState(newOverrideState);
    };

    fetchAndSetState();
  }

  function runHttpRequests() {
    const requests = useContent?.()?.data?.httpRequests ?? {};
    Object.entries(requests).forEach(([key, url]) => {
      if (url && (!httpReqsData()[key] || isEditing())) {
        const evaluatedUrl = evalExpression(url);
        handleRequest({
          url: evaluatedUrl,
          key,
        });
      }
    });
  }

  function emitStateUpdate() {
    window.dispatchEvent(
      new CustomEvent('builder:component:stateChange', {
        detail: {
          state: state(),
          ref: {
            name: props.model,
          },
        },
      })
    );
  }

  useEffect(() => {
    if (isBrowser()) {
      if (isEditing()) {
        window.addEventListener('message', processMessage);
        window.addEventListener(
          'builder:component:stateChangeListenerActivated',
          emitStateUpdate
        );
      }

      if (useContent()) {
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
      runHttpRequests();
      emitStateUpdate();
    }
  }, []);

  useEffect(() => {
    evaluateJsCode();
  }, [useContent?.()?.data?.jsCode]);
  useEffect(() => {
    runHttpRequests();
  }, [useContent?.()?.data?.httpRequests]);
  useEffect(() => {
    emitStateUpdate();
  }, [state()]);

  useEffect(() => {
    return () => {
      if (isBrowser()) {
        window.removeEventListener('message', processMessage);
        window.removeEventListener(
          'builder:component:stateChangeListenerActivated',
          emitStateUpdate
        );
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
          return state();
        },

        get context() {
          return context();
        },

        get apiKey() {
          return props.apiKey;
        },
      }}
    >
      {useContent() ? (
        <>
          <View
            onClick={(event) =>
              track('click', {
                contentId: useContent().id,
              })
            }
            data-builder-content-id={useContent?.()?.id}
          >
            {(useContent?.()?.data?.cssCode ||
              useContent?.()?.data?.customFonts?.length) &&
            !isReactNative() ? (
              <View>
                <Text>{useContent().data.cssCode}</Text>

                <Text>{state().getFontCss(useContent().data)}</Text>
              </View>
            ) : null}

            <RenderBlocks blocks={useContent?.()?.data?.blocks} />
          </View>
        </>
      ) : null}
    </BuilderContext.Provider>
  );
}
