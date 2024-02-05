import {
  RenderContent,
  _processContentResult,
  getContent,
  subscribeToEditor,
} from '@builder.io/sdk-react';
import type { BuilderContent } from '@builder.io/sdk-react/types/types/builder-content';
import { getProps } from '@e2e/tests';
import { useEffect, useState } from 'react';

const REAL_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660';
function DataPreview() {
  const [coffee, setProps] = useState<BuilderContent | undefined | null>(
    undefined
  );

  useEffect(() => {
    getContent({ apiKey: REAL_API_KEY, model: 'coffee' }).then(setProps);

    const unsubscribe = subscribeToEditor({ model: 'coffee' }, (x) => {
      console.log('got new props', x);

      setProps(x);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!coffee) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <div>coffee name: {coffee?.data?.name}</div>
      <div>coffee info: {coffee?.data?.info}</div>
    </>
  );
}

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
    getProps({ _processContentResult, data: 'real', getContent }).then(
      setProps
    );
  }, []);

  if (window.location.pathname === '/preview-coffee') {
    return <DataPreview />;
  }

  return props ? (
    <DataComp pathname={window.location.pathname}>
      {({ data }) => (
        <RenderContent
          {...props}
          data={data}
          linkComponent={
            window.location.search.includes('link-component')
              ? CustomLinkComp
              : undefined
          }
        />
      )}
    </DataComp>
  ) : (
    <div>Content Not Found</div>
  );
}

export default App;
