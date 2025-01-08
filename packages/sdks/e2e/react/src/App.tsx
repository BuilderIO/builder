import {
  Content,
  _processContentResult,
  fetchOneEntry,
  subscribeToEditor,
} from '@builder.io/sdk-react';
import { getProps } from '@sdk/tests';
import { useEffect, useState } from 'react';
import BuilderBlockWithClassName from './components/BuilderBlockWithClassName';
import ComponentNeedsHello from './components/ComponentNeedsHello';
import { componentWithLocalizedSubfieldsInfo } from './components/ComponentWithLocalizedSubfields';
import Hello from './components/Hello';

const builderBlockWithClassNameCustomComponent = {
  name: 'BuilderBlockWithClassName',
  component: BuilderBlockWithClassName,
  shouldReceiveBuilderProps: {
    builderBlock: true,
  },
  inputs: [
    {
      name: 'content',
      type: 'uiBlocks',
      defaultValue: [
        {
          '@type': '@builder.io/sdk:Element',
          '@version': 2,
          id: 'builder-c6e179528dee4e62b337cf3f85d6496f',
          component: {
            name: 'Text',
            options: {
              text: 'Enter some text...',
            },
          },
          responsiveStyles: {
            large: {
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              flexShrink: '0',
              boxSizing: 'border-box',
              marginTop: '20px',
              lineHeight: 'normal',
              height: 'auto',
            },
          },
        },
      ],
    },
  ],
};

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
      const unsubscribe = subscribeToEditor('coffee', (content) =>
        setProps({ content })
      );

      return () => {
        unsubscribe();
      };
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
