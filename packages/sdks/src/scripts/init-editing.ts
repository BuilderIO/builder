import { SDK_VERSION } from '../constants/sdk-version.js';
import { TARGET } from '../constants/target.js';
import { isBrowser } from '../functions/is-browser.js';
import { isFromTrustedHost } from '../functions/is-from-trusted-host.js';
import { register } from '../functions/register.js';

export const registerInsertMenu = () => {
  register('insertMenu', {
    name: '_default',
    default: true,
    items: [
      { name: 'Box' },
      { name: 'Text' },
      { name: 'Image' },
      { name: 'Columns' },
      ...(TARGET === 'reactNative'
        ? []
        : [
            { name: 'Core:Section' },
            { name: 'Core:Button' },
            { name: 'Embed' },
            { name: 'Custom Code' },
          ]),
    ],
  });
};

let isSetupForEditing = false;
export const setupBrowserForEditing = (
  options: {
    enrich?: boolean;
    includeRefs?: boolean;
    locale?: string;
    trustedHosts?: string[];
  } = {}
) => {
  if (isSetupForEditing) {
    return;
  }
  isSetupForEditing = true;
  if (isBrowser()) {
    window.parent?.postMessage(
      {
        type: 'builder.sdkInfo',
        data: {
          target: TARGET,
          version: SDK_VERSION,
          supportsPatchUpdates: false,
          // Supports builder-model="..." attribute which is needed to
          // scope our '+ add block' button styling
          supportsAddBlockScoping: true,
          supportsCustomBreakpoints: true,
        },
      },
      '*'
    );

    window.parent?.postMessage(
      {
        type: 'builder.updateContent',
        data: {
          options,
        },
      },
      '*'
    );

    window.addEventListener('message', (event: MessageEvent) => {
      if (!isFromTrustedHost(options.trustedHosts, event)) {
        return;
      }
      const { data } = event;
      if (!data?.type) {
        return;
      }

      switch (data.type) {
        case 'builder.evaluate': {
          const text = data.data.text;
          const args = data.data.arguments || [];
          const id = data.data.id;
          // tslint:disable-next-line:no-function-constructor-with-string-args
          const fn = new Function(text);
          let result: any;
          let error: Error | null = null;
          try {
            // eslint-disable-next-line prefer-spread
            result = fn.apply(null, args);
          } catch (err) {
            error = err as Error;
          }

          if (error) {
            window.parent?.postMessage(
              {
                type: 'builder.evaluateError',
                data: { id, error: error.message },
              },
              '*'
            );
          } else {
            if (result && typeof result.then === 'function') {
              (result as Promise<any>)
                .then((finalResult) => {
                  window.parent?.postMessage(
                    {
                      type: 'builder.evaluateResult',
                      data: { id, result: finalResult },
                    },
                    '*'
                  );
                })
                .catch(console.error);
            } else {
              window.parent?.postMessage(
                {
                  type: 'builder.evaluateResult',
                  data: { result, id },
                },
                '*'
              );
            }
          }
          break;
        }
      }
    });
  }
};
