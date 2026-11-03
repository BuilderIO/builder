'use client';
import { useState } from 'react';

// Example of a stateful client component that can be dragged into Builder content.
export const MyFunComponent = (props: { text: string }) => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h3>{props.text.toUpperCase()}</h3>
      <p>{count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>Click me</button>
    </div>
  );
};

export default MyFunComponent;
