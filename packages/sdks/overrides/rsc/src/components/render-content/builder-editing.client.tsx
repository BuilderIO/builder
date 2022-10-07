import { useEffect } from 'react';

export type BuilderEditingProps = {
  model: string;
  components?: Partial<BuilderComponent>[];
  children: any;
  onEditingUpdate?: (url: URL) => void;
};

let browserSetup = false;

export const setupBrowserForEditing = () => {
  if (browserSetup) {
    return;
  }

  browserSetup = true;
  window.parent?.postMessage(
    {
      type: 'builder.sdkInfo',
      data: {
        target: 'reactServerComponents',
        // TODO: compile these in
        // type: process.env.SDK_TYPE,
        // version: process.env.SDK_VERSION,
        supportsPatchUpdates: false,
        // Supports builder-model="..." attribute which is needed to
        // scope our '+ add block' button styling
        supportsAddBlockScoping: false,
      },
    },
    '*'
  );

  window.addEventListener('message', ({ data }) => {
    if (data) {
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
    }
  });
};

export default function BuilderEditing(props: BuilderEditingProps) {
  useEffect(() => {
    setupBrowserForEditing();

    if (props.components) {
      for (const component of props.components) {
        window.parent.postMessage(
          {
            type: 'builder.registerComponent',
            data: component,
          },
          '*'
        );
      }
    }

    function onMessage(e: MessageEvent) {
      switch (e.data?.type) {
        case 'builder.contentUpdate': {
          fetch('/api/builderData', {
            body: JSON.stringify(e.data.data),
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }).then(() => {
            const current = new URL(window.location.href);
            current.searchParams.set('v', String(Date.now()));
            props.onEditingUpdate?.(current);
          });
        }
      }
    }

    addEventListener('message', onMessage);

    return () => window.removeEventListener('message', onMessage);
  }, [props.model]);
  return (
    <div
      onClickCapture={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {props.children}
    </div>
  );
}
