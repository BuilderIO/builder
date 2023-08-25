import type { BlocksWrapperProps } from './blocks-wrapper';

import { Fragment, component$ } from '@builder.io/qwik';

export type BlocksProps = Partial<BlocksWrapperProps> & {};

export const Columns = component$((props: any) => {
  return <div>in Columns: {props.columns[0].text}</div>;
});

export const Blocks = component$((props: BlocksProps) => {
  return (
    <>
      <div>outside loop: {props.blocks[0].columns[0].text}</div>
      {props.blocks?.map((block) => {
        return (
          <Fragment key={'render-block-' + block}>
            <Columns columns={block.columns} />
          </Fragment>
        );
      })}
    </>
  );
});

export default Blocks;
