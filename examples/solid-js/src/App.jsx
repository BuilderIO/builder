import styles from './App.module.css';
import logo from './logo.svg';

import { Content, fetchOneEntry } from '@builder.io/sdk-solid';
import { createEffect, createSignal } from 'solid-js';
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
  const [content, setContent] = createSignal(null);

  createEffect(() => {
    fetchOneEntry({
      model: 'page',
      apiKey,
      userAttributes: {
        urlPath: window.location.pathname,
      },
    }).then(content => {
      setContent(content);
    });
  });

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
      </header>
      <div>
        {content() && (
          <Content
            model="page"
            content={content()}
            apiKey={apiKey}
            customComponents={CUSTOM_COMPONENTS}
          />
        )}
      </div>
    </div>
  );
}

export default App;
