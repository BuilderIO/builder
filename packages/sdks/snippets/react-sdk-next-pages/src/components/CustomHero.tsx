// components/CustomHero.tsx
'use client';
import type { RegisteredComponent } from '@builder.io/sdk-react';
import type { PropsWithChildren } from 'react';

export function CustomHero({ children }: PropsWithChildren) {
  return (
    <>
      <div>This is text from your component</div>
      {children}
    </>
  );
}

export const customHeroInfo: RegisteredComponent = {
  component: CustomHero,
  name: 'CustomHero',
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
