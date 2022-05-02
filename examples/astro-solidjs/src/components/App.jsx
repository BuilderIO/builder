import { RenderContent, registerComponent } from '@builder.io/sdk-solid';
import { createEffect } from 'solid-js';
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

function App({ builderContent }) {
  return (
    <div>
      <header class="text-center p-5">Hello world!</header>
      <div>
        <RenderContent content={builderContent} model="page" />
      </div>
    </div>
  );
}

export default App;
