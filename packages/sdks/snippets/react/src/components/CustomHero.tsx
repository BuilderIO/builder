import { RegisteredComponent } from '@builder.io/sdk-react';
import { ReactNode } from 'react';

interface CustomHeroProps {
  children: ReactNode;
}

const CustomHero = (props: CustomHeroProps) => {
  return (
    <>
      <div>This is your component's text</div>

      {props.children}
    </>
  );
};

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
