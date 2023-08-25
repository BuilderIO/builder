import type { BuilderBlock } from '../../types/builder-block';

import type {
  BuilderComponentsProp,
  PropsWithBuilderData,
} from '../../types/builder-props';

import { component$ } from '@builder.io/qwik';

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
export const Columns = component$(
  (props: PropsWithBuilderData<ColumnProps>) => {
    return (
      <div>in Columns: {props.columns[0].blocks[1].component.options.text}</div>
    );
  }
);

export default Columns;
