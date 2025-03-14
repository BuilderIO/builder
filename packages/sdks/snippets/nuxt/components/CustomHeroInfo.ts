import type { RegisteredComponent } from '@builder.io/sdk-vue';
import CustomHero from './CustomHero.vue';

const CustomHeroInfo: RegisteredComponent = {
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

export default CustomHeroInfo;
