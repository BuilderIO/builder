import logo from './logo.svg';
import styles from './App.module.css';

import { RenderContent } from '@builder.io/sdk-solid';

const content = {
  data: {
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        responsiveStyles: {
          large: {
            padding: '20px',
            backgroundColor: 'red',
            color: 'white',
          },
        },
        component: {
          name: 'Text',
          options: {
            text: 'Hi there',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        responsiveStyles: {
          large: {
            margin: '10px',
            padding: '20px',
            backgroundColor: 'white',
          },
        },
        component: {
          name: 'Text',
          options: {
            text: 'Hello',
          },
        },
      },
    ],
  },
};

function App() {
  return (
    <>
      <RenderContent model="page" content={content} />
    </>
  );
}

export default App;
