import { RegisteredComponent } from '@builder.io/sdk-react';
import { ReactNode } from 'react';

interface CustomHeroProps {
  children: ReactNode;
}

const CustomHero = (props: CustomHeroProps) => {
  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          border: '10px solid #ccc',
          padding: '10px',
          height: '20px',
          borderColor: 'black',
        }}
      >
        This is a your component's text
      </div>

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
