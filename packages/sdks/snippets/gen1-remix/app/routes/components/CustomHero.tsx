import { ReactNode } from 'react';

interface CustomHeroProps {
  children: ReactNode;
}

export const CustomHero = (props: CustomHeroProps) => {
  return (
    <>
      <div>This is your component&apos;s text</div>
      {props.children}
    </>
  );
};
