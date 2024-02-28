// snippet #1: MyFunComponent.tsx
import { RegisteredComponent } from '@builder.io/sdk-react';
import { useState } from 'react';

export const MyFunComponent = (props: { text: string }) => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h3>{props.text.toUpperCase()}</h3>
      <p>{count}</p>
      <button onClick={() => setCount(count++)}>Click me</button>
    </div>
  );
};

// snippet #2: your-custom-components.ts (React version)
export const customComponents: RegisteredComponent[] = [
  {
    component: MyFunComponent,
    // ---> You could also lazy load your component using:
    // component: React.lazy(() => import('./MyFunComponent')),
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

// snippet #2: your-custom-components.ts (Next version)
import dynamic from 'next/dynamic';
export const customComponents: RegisteredComponent[] = [
  {
    component: dynamic(() => import('./MyFunComponent')),
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

// =====================
// =====================
// =====================
// snippet #3
import { CUSTOM_COMPONENTS } from './your-custom-components';

export default function App() {
  return (
    <Content
      model="page"
      content={YOUR_CONTENT}
      apiKey={YOUR_API_KEY}
      customComponents={CUSTOM_COMPONENTS} // <-- Add component here
    />
  );
}
