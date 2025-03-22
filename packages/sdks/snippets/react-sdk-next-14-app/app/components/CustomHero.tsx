// app/components/CustomHero.tsx
'use client';

import type { RegisteredComponent } from '@builder.io/sdk-react';
import type { PropsWithChildren } from 'react';

const CustomHero = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div>This is text from your component</div>
      {children}
    </>
  );
};

export const customHeroInfo: RegisteredComponent = {
  name: 'CustomHero',
  component: CustomHero,
  canHaveChildren: true,
  defaultChildren: [
    {
      '@type': '@builder.io/sdk:Element',
      component: {
        name: 'Text',
        options: {
          text: 'This is Builder text',
        },
      },
    },
  ],
};
