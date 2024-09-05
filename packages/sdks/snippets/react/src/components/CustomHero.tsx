import { ReactNode } from 'react';

interface CustomHeroProps {
  children: ReactNode;
}

const CustomHero: React.FC<CustomHeroProps> = (props) => {
  return <div className="Hero">{props.children}</div>;
};

export default CustomHero;
