import type { RegisteredComponent } from '@builder.io/sdk-svelte';
import CustomHero from './CustomHero.svelte';

export const customHeroInfo: RegisteredComponent = {
  component: CustomHero,
  name: 'CustomHero', // you can change this to anything you want
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
