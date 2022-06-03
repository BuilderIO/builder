import { RenderContent } from '@builder.io/sdk-solid';
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
        <RenderContent content={builderContent} model="page" customComponents={CUSTOM_COMPONENTS} />
      </div>
    </div>
  );
}

export default App;
