import { RegisteredComponent } from '@builder.io/sdk-react';
import CustomHero from './CustomHero';

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
      responsiveStyles: {
        large: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '10px',
          backgroundColor: '#87CEEB',
          marginTop: '10px',
        },
      },
    },
  ],
  defaultStyles: {
    border: '10px solid #ccc',
    padding: '10px',
  },
};
