// app/components/CustomHero.tsx
import React from 'react';
import type {RegisteredComponent} from '@builder.io/sdk-react';

export function CustomHero({children}: {children?: React.ReactNode}) {
  return (
    <>
      <div>This is text from your component</div>
      {children}
    </>
  );
}

export const customHeroInfo: RegisteredComponent = {
  name: 'CustomHero',
  component: CustomHero,
  canHaveChildren: true,
  defaultChildren: [
    {
      '@type': '@builder.io/sdk:Element',
      component: {
        name: 'Text',
        options: {text: 'This is Builder text'},
      },
    },
  ],
};
