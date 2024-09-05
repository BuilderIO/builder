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

export default CustomHero;
