import logo from './logo.svg';
import styles from './App.module.css';

import { getContent, RenderContent } from '@builder.io/sdk-solid';

const content = {
  data: {
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        responsiveStyles: {
          large: {
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
          },
        },
        component: {
          name: 'Text',
          options: {
            text: 'I am an accordion title. Click me!',
          },
        },
      },
    ],
  },
};

function App() {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <p>
          Edit <code>src/App.jsx</code> and save to reload.
        </p>
        <a
          class={styles.link}
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a>

        <RenderContent content={content} />
      </header>
    </div>
  );
}

export default App;
