import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { RegisteredComponent } from '@builder.io/sdk-qwik';
import { fetchOneEntry, Content } from '@builder.io/sdk-qwik';

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
    inputs: [
      {
        name: 'text',
        type: 'string',
        defaultValue: 'Hello world',
      },
    ],
  },
];

export const useBuilderContentLoader = routeLoader$(async event => {
  const data = await fetchOneEntry({
    model: 'page',
    apiKey: apiKey,
    userAttributes: { urlPath: event.url.pathname },
    options: event.query,
  });

  if (!data) {
    throw event.error(404, 'page not found');

    // if you want to handle the 404 in the component, you can do this instead of throwing `event.error()`
    // event.status(404);
  }

  return data;
});

export default component$(() => {
  const content = useBuilderContentLoader();

  // if using `event.status(404)`, uncomment these lines:
  // if (content === null) {
  //   return <h1>Page not found</h1>;
  // }

  return (
    <Content
      model="page"
      content={content.value}
      apiKey={apiKey}
      customComponents={CUSTOM_COMPONENTS}
    />
  );
});

export const head: DocumentHead = {
  title: 'Welcome to Qwik',
};
