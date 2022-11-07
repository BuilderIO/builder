import { component$, Resource, useResource$, useStore } from '@builder.io/qwik';
import { DocumentHead, useLocation } from '@builder.io/qwik-city';
import { getContent, RegisteredComponent, RenderContent } from '@builder.io/sdk-qwik';

// Enter your key here!
export const apiKey = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

export const MyFunComponent = component$((props: { text: string }) => {
  const state = useStore({
    count: 0,
  });

  return (
    <div>
      <h3>{props.text.toUpperCase()}</h3>
      <p>{state.count}</p>
      <button onClick$={() => state.count++}>Click me</button>
    </div>
  );
});

export const CUSTOM_COMPONENTS: RegisteredComponent[] = [
  {
    component: MyFunComponent,
    name: 'MyFunComponent',
    builtIn: true,
    inputs: [
      {
        name: 'text',
        type: 'string',
        defaultValue: 'Hello world',
      },
    ],
  },
];

export default component$(() => {
  const { pathname } = useLocation();

  const builderContent = useResource$(() =>
    getContent({
      model: 'page',
      apiKey: apiKey,
      userAttributes: { urlPath: pathname },
    })
  );

  return (
    <div>
      <Resource
        value={builderContent}
        onPending={() => <>Loading...</>}
        onRejected={error => <>Error: {error.message}</>}
        onResolved={content => (
          <RenderContent
            model="page"
            content={content}
            apiKey={apiKey}
            customComponents={CUSTOM_COMPONENTS}
          />
        )}
      />
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Welcome to Qwik',
};
