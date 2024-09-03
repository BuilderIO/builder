import type { BuilderBlock } from '../../types/builder-block';
import type { BuilderComponentsProp, BuilderDataProps, BuilderLinkComponentProp } from '../../types/builder-props';
export type Column = {
  blocks: BuilderBlock[];
  width?: number;
  link?: string;
};
type StackColumnsAt = 'tablet' | 'mobile' | 'never';
export interface ColumnProps extends BuilderComponentsProp, BuilderLinkComponentProp, BuilderDataProps {
  columns?: Column[];
  space?: number;
  stackColumnsAt?: StackColumnsAt;
  reverseColumnsWhenStacked?: boolean;
}