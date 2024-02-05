import type { ContentProps } from '../components/content/content.types.js';
import { isBrowser } from '../functions/is-browser.js';
import { isFromTrustedHost } from '../functions/is-from-trusted-host.js';
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

/**
 * Subscribes to the Builder editor to listen for content updates.
 * Sends the updated content to the callback function.
 */
export const subscribeToEditor = (
  { model, trustedHosts = [] }: Pick<ContentListener, 'model' | 'trustedHosts'>,
  callback: ContentListener['callbacks']['contentUpdate']
) => {
  if (!isBrowser) {
    logger.warn(
      '`subscribeToEditor` only works in the browser. It currently seems to be running on the server.'
    );
    return;
  }

  const listener = createEditorListener({
    callbacks: {
      contentUpdate: callback,
      animation: () => {},
      configureSdk: () => {},
    },
    model,
    trustedHosts,
  });

  window.addEventListener('message', listener);

  return () => {
    window.removeEventListener('message', listener);
  };
};
