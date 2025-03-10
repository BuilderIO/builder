import CustomHero from '@/components/custom-components/custom-hero/CustomHero.vue';
import type { RegisteredComponent } from '@builder.io/sdk-vue';

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
