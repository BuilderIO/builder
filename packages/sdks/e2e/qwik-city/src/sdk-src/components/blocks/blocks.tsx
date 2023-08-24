import Columns from '~/sdk-src/columns/columns';
import { component$ } from '@builder.io/qwik';
import type { BuilderBlock } from '~/sdk-src/types/builder-block';

export const Blocks = component$((props: { blocks: BuilderBlock[] }) => {
  return (
    <>
      <div>
        BLOCKS (outside loop):{' '}
        {
          props.blocks[0]?.component?.options.columns[0].blocks[0].component
            .options.text
        }
      </div>
      {props.blocks.map((block) => {
        return (
          <>
            <div>
              BLOCKS (inside loop):
              <span>
                {
                  block.component?.options.columns[0].blocks[0].component
                    ?.options.text
                }
              </span>
            </div>
            <Columns columns={block.component?.options.columns} />
          </>
        );
      })}
    </>
  );
});

export default Blocks;
