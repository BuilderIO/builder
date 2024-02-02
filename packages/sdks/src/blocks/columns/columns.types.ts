import type { BuilderBlock } from '../../types/builder-block.js';
import type {
  BuilderComponentsProp,
  BuilderLinkComponentProp,
} from '../../types/builder-props.js';

type Column = {
  blocks: BuilderBlock[];
  width?: number;
  link?: string;
};

type StackColumnsAt = 'tablet' | 'mobile' | 'never';

export interface ColumnProps
  extends BuilderComponentsProp,
    BuilderLinkComponentProp {
  columns?: Column[];
  space?: number;
  stackColumnsAt?: StackColumnsAt;
  reverseColumnsWhenStacked?: boolean;
}
