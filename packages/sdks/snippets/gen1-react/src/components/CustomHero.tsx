import { type PropsWithChildren } from 'react';

const CustomHero = (props: PropsWithChildren) => {
  return (
    <>
      <div>This is your component's text</div>
      {props.children}
    </>
  );
};

export default CustomHero;
