import {
  Content,
  _processContentResult,
  fetchOneEntry,
  subscribeToEditor,
  registerAction
} from '@builder.io/sdk-react';
import { getProps } from '@sdk/tests';
import { useEffect, useState } from 'react';
import { builderBlockWithClassNameCustomComponent } from './components/BuilderBlockWithClassName';
import ComponentNeedsHello from './components/ComponentNeedsHello';
import { componentWithLocalizedSubfieldsInfo } from './components/ComponentWithLocalizedSubfields';
import { Description } from './components/Description';
import Hello from './components/Hello';

const DataComp = (props: {
  pathname: string;
  children: (args: { data?: { x?: string } }) => React.ReactNode;
}) => {
  const [data, setData] = useState('foo');
  if (props.pathname === '/external-data') {
    return (
      <div>
        <div>External data: {data}</div>
        <button onClick={() => setData(data === 'foo' ? 'bar' : 'foo')}>
          Change value
        </button>
        {props.children({ data: { x: data } })}
      </div>
    );
  } else {
    return props.children({});
  }
};

const CustomLinkComp = (props: any) => {
  return <a {...props}>Custom Link: {props.children}</a>;
};

function App() {
  const [props, setProps] = useState<any>(undefined);

  useEffect(() => {
    getProps({ _processContentResult, fetchOneEntry }).then(setProps);

    if (window.location.pathname === '/data-preview') {
      const unsubscribe = subscribeToEditor({
        model: 'coffee',
        apiKey: 'abcd',
        callback: (content) => setProps({ content }),
      });

      return () => {
        unsubscribe();
      };
    }
    if (typeof window !== 'undefined') {
      registerAction({
        name: "test-action",
        kind: 'function',
        id: 'test-action-id',
        inputs:[
          {
            name: "actionName",
            type: "string",
            required: true,
            helperText: "Action name",
          },
        ],
        action:  () => {
          return`console.log("function call")`
        },
      });
    }
  }, []);

  if (window.location.pathname === '/data-preview') {
    if (!props?.content) {
      return <div>Loading...</div>;
    }
    return (
      <>
        <div>coffee name: {props.content.data?.name}</div>
        <div>coffee info: {props.content.data?.info}</div>
      </>
    );
  }

  return props ? (
    <DataComp pathname={window.location.pathname}>
      {({ data }) => (
        <Content
          {...props}
          data={data || props.data}
          linkComponent={
            window.location.search.includes('link-component')
              ? CustomLinkComp
              : undefined
          }
          customComponents={[
            {
              name: 'Hello',
              component: Hello,
              inputs: [],
              ...(window.location.pathname.includes(
                'custom-components-models'
              ) && {
                models: ['test-model'],
              }),
            },
            {
              name: 'Description',
              component: Description,
              inputs: [
                {
                  name: 'text',
                  type: 'string',
                  defaultValue: 'Hello',
                },
              ],
            },
            {
              name: 'ComponentNeedsHello',
              component: ComponentNeedsHello,
              shouldReceiveBuilderProps: {
                builderComponents: true,
              },
            },
            builderBlockWithClassNameCustomComponent,
            componentWithLocalizedSubfieldsInfo,
          ]}
        />
      )}
    </DataComp>
  ) : (
    <div>Content Not Found</div>
  );
}

export default App;
