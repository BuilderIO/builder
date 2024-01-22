import type { BuilderBlock } from '../../types/builder-block.js';
import type { BuilderComponentsProp } from '../../types/builder-props.js';

type Column = {
  blocks: BuilderBlock[];
  width?: number;
};

type StackColumnsAt = 'tablet' | 'mobile' | 'never';

export interface ColumnProps extends BuilderComponentsProp {
  columns?: Column[];
  builderBlock: BuilderBlock;
  space?: number;
  stackColumnsAt?: StackColumnsAt;
  reverseColumnsWhenStacked?: boolean;
}
