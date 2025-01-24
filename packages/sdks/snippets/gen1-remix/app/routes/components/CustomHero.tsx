import { type PropsWithChildren } from 'react';

// Define the component
export const CustomHero = (props: PropsWithChildren) => {
  return (
    <>
      <div>This is text from your component</div>
      {props.children}
    </>
  );
};
