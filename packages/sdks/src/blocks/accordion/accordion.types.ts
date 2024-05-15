import type { BuilderBlock } from '../../types/builder-block.js';

export interface AccordionProps {
  items: {
    title: BuilderBlock[];
    detail: BuilderBlock[];
  }[];
  oneAtATime?: boolean;
  grid?: boolean;
  defaultOpen?: number;
  builderBlock?: BuilderBlock;
  gridRowWidth?: number;
  useChildrenForItems?: boolean;
}
