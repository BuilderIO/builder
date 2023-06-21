import Slider from './slider.lite';
import type { BuilderElement } from '../../types/element';
type BuilderBlockType = BuilderElement;

interface CarouselProps {
  slides: Array<any | { content: BuilderBlockType[] }>;
  builderBlock: BuilderBlockType;
  nextButton?: BuilderBlockType[];
  prevButton?: BuilderBlockType[];
  autoplay?: boolean;
  autoplaySpeed?: number;
  hideDots?: boolean;
  useChildrenForSlides?: boolean;
}

export default function Carousel(props: CarouselProps) {
  return (
    <Slider
      builderBlock={props.builderBlock}
      useChildrenForSlides={props.useChildrenForSlides}
      slides={props.slides}
      autoplay={props.autoplay}
      autoplaySpeed={
        props.autoplaySpeed ? props.autoplaySpeed * 1000 : undefined
      }
      dots={!props.hideDots}
      prevArrow={props.prevButton}
      frontArrow={props.nextButton}
    />
  );
}
