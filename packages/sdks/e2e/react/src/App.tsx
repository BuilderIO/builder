import { RenderContent, _processContentResult } from '@builder.io/sdk-react';
import { getProps } from '@e2e/tests';
import { useEffect, useState } from 'react';

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

function App() {
  const [props, setProps] = useState<any>(undefined);

  useEffect(() => {
    getProps({ _processContentResult }).then((resp) => {
      setProps(resp);
    });
  }, []);

  return props ? (
    <DataComp pathname={window.location.pathname}>
      {({ data }) => <RenderContent {...props} data={data} />}
    </DataComp>
  ) : (
    <div>Content Not Found</div>
  );
}

export default App;
