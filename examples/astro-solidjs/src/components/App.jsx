import { Content } from '@builder.io/sdk-solid';
import { createMutable } from 'solid-js/store';

function MyFunComponent({ text }) {
  const state = createMutable({
    count: 0,
  });

  return (
    <div>
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

function App({ builderContent }) {
  return (
    <div>
      <header class="text-center p-5">Hello world!</header>
      <div>
        <Content
          content={builderContent}
          model="page"
          customComponents={CUSTOM_COMPONENTS}
          apiKey={'f1a790f8c3204b3b8c5c1795aeac4660'}
        />
      </div>
    </div>
  );
}

export default App;
