import { type PropsWithChildren } from 'react';

const CustomHero = (props: PropsWithChildren) => {
  return (
    <>
      <div>This is text from your component</div>
      {props.children}
    </>
  );
};

export default CustomHero;
