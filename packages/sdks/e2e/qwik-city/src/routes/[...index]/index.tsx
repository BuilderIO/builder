import * as ivm from 'isolated-vm';
import { getProps } from '@e2e/tests';
import { RenderContent, _processContentResult } from '@builder.io/sdk-qwik';
import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
const getIsolateContext = () => {
  // if (Builder.serverContext) {
  //   return Builder.serverContext;
  // }
  // Builder.setServerContext(isolate.createContextSync());
  const isolate = new ivm.Isolate({
    memoryLimit: 128,
  });
  return isolate.createContextSync();
};
export interface MainProps {
  url: string;
}

export const useBuilderContentLoader = routeLoader$(async (event) => {
  const data = await getProps({
    pathname: event.url.pathname,
    _processContentResult,
  });

  if (!data) {
    event.status(404);
  }

  return data;
});

export default component$(() => {
  const isolateContext = getIsolateContext();
  const foo = { foo: 123, bar: { bazz: 1 } };
  isolateContext.global.setSync('foo', new ivm.ExternalCopy(foo).copyInto());
  const resultStr = isolateContext.evalSync(
    `
  var newProxy = new Proxy({}, {
    get(target, key) {
      return target[key]
    },
    set(target, key, value) {
      target[key] = value;
      return true
    },
    deleteProperty(target, key) {
      delete target[key];
      return true
    }
  })

  function theFunction(){
  return foo.bar.bazz
}

theFunction()
  `
  );

  // return <div>test {resultStr}</div>;
  const contentProps = useBuilderContentLoader();
  return contentProps.value ? (
    <RenderContent {...contentProps.value} />
  ) : (
    <div>Content Not Found</div>
  );
});
