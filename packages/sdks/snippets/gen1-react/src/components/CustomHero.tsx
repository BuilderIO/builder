type CustomHeroProps = {
  children: React.ReactNode;
};

const CustomHero = (props: CustomHeroProps) => {
  return (
    <>
      <div>This is your component's text</div>
      {props.children}
    </>
  );
};

export default CustomHero;
