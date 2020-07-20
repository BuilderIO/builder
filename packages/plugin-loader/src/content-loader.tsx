import * as reactDom from 'react-dom';
import * as React from 'react';
import { BuilderComponent } from '@builder.io/react';

function ComponentLoader(props: { content?: any }) {
  const [value, setValue] = React.useState(null);
  const [content, setContent] = React.useState(props.content);

  function valueChangeListner(event: MessageEvent) {
    const data = event.data;
    // TODO: message for values and value change
    if (data && data.type === 'builder.updateEditorValue') {
      setValue(data.data.value);
    } else if (data && data.type === 'builder.loadContent') {
      setContent(data.data.content);
    }
  }

  React.useEffect(() => {
    addEventListener('message', valueChangeListner);
    return () => removeEventListener('message', valueChangeListner);
  }, []);

  return (
    <BuilderComponent
      content={{
        data: {
          blocks: [
            {
              '@type': '@builder.io/sdk:Element',
              responsiveStyles: {
                large: {
                  height: '50px',
                  width: '50px',
                  backgroundColor: 'red',
                },
              },
              component: {
                name: 'Text',
                options: {
                  text: 'Hello!',
                },
              },
            },
          ],
        },
      }}
      model="page"
      apiKey="YJIGb4i01jvw0SRdL5Bt"
      data={{
        value,
      }}
      onStateChange={state => {
        setValue(state.value);

        self.postMessage(
          {
            type: 'builder.workerEditorValueChange',
            data: {
              value: state.value,
            },
          },
          undefined as any
        );
        // TODO: message up
      }}
    />
  );
}

reactDom.render(
  React.createElement(ComponentLoader as any, {
    // content: data.data.content
    // Send value down and up
  }),
  document.body
);

let loaded = false;
if (typeof self !== 'undefined') {
  self.addEventListener('message', event => {
    console.log('message?', event.data, event);
    const data = event.data;
    // TODO: message for values and value change
    if (data && data.type === 'builder.loadContent' && !loaded) {
      loaded = true;
      reactDom.render(
        React.createElement(ComponentLoader, {
          content: data.data.content,
          // Send value down and up
        }),
        document.body
      );
    }
  });
  self.postMessage(
    {
      type: 'builder.workerLoaded',
      data: {
        type: 'content',
      },
    },
    undefined as any
  );
}
