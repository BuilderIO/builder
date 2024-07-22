import type { BuilderBlock } from '../../types/builder-block.js';
import type {
  BuilderComponentsProp,
  BuilderDataProps,
  BuilderLinkComponentProp,
  BuilderNonceProp,
} from '../../types/builder-props.js';

export interface AccordionProps
  extends BuilderComponentsProp,
    BuilderLinkComponentProp,
    BuilderDataProps,
    BuilderNonceProp {
  items: {
    title: BuilderBlock[];
    detail: BuilderBlock[];
  }[];
  oneAtATime?: boolean;
  grid?: boolean;
  gridRowWidth?: string;
  useChildrenForItems?: boolean;
}
