import type { ContentProps } from '../components/content/content.types.js';
import { isBrowser } from '../functions/is-browser.js';
import { isFromTrustedHost } from '../functions/is-from-trusted-host.js';
import { setupBrowserForEditing } from '../scripts/init-editing.js';
import type { BuilderAnimation } from '../types/builder-block.js';
import type { BuilderContent } from '../types/builder-content.js';
import { logger } from './logger.js';

type ContentListener = Required<
  Pick<ContentProps, 'model' | 'trustedHosts'>
> & {
  callbacks: {
    contentUpdate: (updatedContent: BuilderContent) => void;
    animation: (updatedContent: BuilderAnimation) => void;
    configureSdk: (updatedContent: any) => void;
  };
};

export const createEditorListener = ({
  model,
  trustedHosts,
  callbacks,
}: ContentListener) => {
  return (event: MessageEvent<any>): void => {
    if (!isFromTrustedHost(trustedHosts, event)) {
      return;
    }

    const { data } = event;

    if (data) {
      switch (data.type) {
        case 'builder.configureSdk': {
          callbacks.configureSdk(data.data);
          break;
        }
        case 'builder.triggerAnimation': {
          callbacks.animation(data.data);
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

          if (key === model) {
            callbacks.contentUpdate(contentData);
          }
          break;
        }
      }
    }
  };
};

type SubscribeToEditor = (
  /**
   * The Builder `model` to subscribe to
   */
  model: string,
  /**
   * The callback function to call when the content is updated.
   */
  callback: (updatedContent: BuilderContent) => void,
  /**
   * Extra options for the listener.
   */
  options?: {
    /**
     * List of hosts to allow editing content from.
     */
    trustedHosts?: string[] | undefined;
  }
) => () => void;

/**
 * Subscribes to the Builder editor and listens to `content` updates of a certain `model`.
 * Sends the updated `content` to the `callback` function.
 */
export const subscribeToEditor: SubscribeToEditor = (
  model,
  callback,
  options
) => {
  if (!isBrowser) {
    logger.warn(
      '`subscribeToEditor` only works in the browser. It currently seems to be running on the server.'
    );
    return () => {};
  }
  setupBrowserForEditing();

  const listener = createEditorListener({
    callbacks: {
      contentUpdate: callback,
      animation: () => {},
      configureSdk: () => {},
    },
    model,
    trustedHosts: options?.trustedHosts,
  });

  window.addEventListener('message', listener);

  return () => {
    window.removeEventListener('message', listener);
  };
};
