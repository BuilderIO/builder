import type { BlocksWrapperProps } from './blocks-wrapper';

import { Fragment, component$ } from '@builder.io/qwik';

export type BlocksProps = Partial<BlocksWrapperProps> & {};

export const Columns = component$((props: any) => {
  return (
    <div>in Columns: {props.columns[0].blocks[1].component.options.text}</div>
  );
});

export const Blocks = component$((props: BlocksProps) => {
  return (
    <>
      <div>
        in BLOCKS (outside loop):{' '}
        {
          // @ts-ignore
          props.blocks[0].children[1].component.options.columns[0].blocks[1]
            .component.options.text
        }
      </div>
      {props.blocks?.map((block) => {
        return (
          <Fragment key={'render-block-' + block.id}>
            {/* <div>
        in BLOCKS (inside loop): {props.context.content.data.blocks[0].children[1].component.options.columns[0].blocks[1].component.options.text}
      </div> */}
            <Columns columns={block.children[1].component.options.columns} />
          </Fragment>
        );
      })}
    </>
  );
});

export default Blocks;
