import { type PropsWithChildren } from 'react';

export const CustomHero = (props: PropsWithChildren) => {
  return (
    <>
      <div>This is your component`s text</div>
      {props.children}
    </>
  );
};
