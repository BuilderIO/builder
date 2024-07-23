import type { BuilderBlock } from '../../types/builder-block.js';
import type {
  BuilderComponentsProp,
  BuilderDataProps,
  BuilderLinkComponentProp,
} from '../../types/builder-props.js';

export interface AccordionProps
  extends BuilderComponentsProp,
    BuilderLinkComponentProp,
    BuilderDataProps {
  items: {
    title: BuilderBlock[];
    detail: BuilderBlock[];
  }[];
  oneAtATime?: boolean;
  grid?: boolean;
  gridRowWidth?: string;
  useChildrenForItems?: boolean;
}
