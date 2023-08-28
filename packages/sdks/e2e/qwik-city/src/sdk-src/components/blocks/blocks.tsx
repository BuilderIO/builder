import { component$, Fragment } from '@builder.io/qwik';
import type { Content } from '../content/content.types';

export const Columns = component$(
  (props: { columns: Content['blocks'][0]['columns'] }) => {
    return <div>in Columns: {props.columns[0]}</div>;
  }
);

export const Blocks = component$((props: { content: Content }) => {
  return (
    <>
      <div>outside loop: {JSON.stringify(props.content.blocks[0].columns)}</div>
      {props.content.blocks.map((block) => {
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
