import logo from './logo.svg';
import styles from './App.module.css';

import { getContent, RenderContent, registerComponent } from '@builder.io/sdk-solid';
import { createEffect } from 'solid-js';
import { createMutable } from 'solid-js/store';

// Enter your key here!
const apiKey = 'bff7106486204af59835fddec84f708f';

function MyFunComponent({ text }) {
  return <div class={styles.funtext}>{text}</div>;
}

registerComponent(MyFunComponent, {
  name: 'MyFunComponent',
  inputs: [
    {
      name: 'text',
      type: 'string',
      defaultValue: 'Hello world',
    },
  ],
});

function App() {
  const state = createMutable({
    content: null,
  });

  createEffect(() => {
    getContent({
      model: 'page',
      apiKey,
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
        <RenderContent model="page" content={state.content} />
      </div>
    </div>
  );
}

export default App;
