import { component$, Slot } from '@builder.io/qwik';
import type { RegisteredComponent } from '@builder.io/sdk-qwik';

export const CustomHero = component$(() => {
  return (
    <>
      <div>This is text from your component</div>
      <Slot />
    </>
  );
});

export const customHeroInfo: RegisteredComponent = {
  component: CustomHero,
  name: 'CustomHero',
  inputs: [],
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
