import { type PropsWithChildren } from 'react';

// Define the component
export const CustomHero = (props: PropsWithChildren) => {
  return (
    <>
      <div>This is your component's text</div>
      {props.children}
    </>
  );
};
