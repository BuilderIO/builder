import logo from './logo.svg';
import styles from './App.module.css';

import {
  getContent,
  RenderContent,
  getBuilderSearchParams,
  convertSearchParamsToQueryObject,
} from '@builder.io/sdk-solid';
import { createEffect } from 'solid-js';
import { createMutable } from 'solid-js/store';

// Enter your key here!
const apiKey = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

function MyFunComponent({ text }) {
  const state = createMutable({
    count: 0,
  });

  return (
    <div class={styles.funtext}>
      <h3>{text.toUpperCase()}</h3>
      <p>{state.count}</p>
      <button onClick={() => state.count++}>Click me </button>
    </div>
  );
}

const CUSTOM_COMPONENTS = [
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

function App() {
  const state = createMutable({
    content: null,
  });

  createEffect(() => {
    getContent({
      model: 'page',
      apiKey,
      options: getBuilderSearchParams(
        convertSearchParamsToQueryObject(new URLSearchParams(window.location.search))
      ),
      userAttributes: {
        urlPath: window.location.pathname,
      },
    }).then(content => {
      state.content = content;
    });
  });

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
      </header>
      <div>
        {state.content && (
          <RenderContent
            model="page"
            content={state.content}
            apiKey={apiKey}
            customComponents={CUSTOM_COMPONENTS}
          />
        )}
      </div>
    </div>
  );
}

export default App;
