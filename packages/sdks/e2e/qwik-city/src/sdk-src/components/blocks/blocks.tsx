import { Fragment, component$ } from '@builder.io/qwik';
import type { Content } from '../content/content.types';

export const Columns = component$((props: { block: string }) => {
  return <div>in Columns: {props.block}</div>;
});

export const Blocks = component$((props: { x: { content: Content } }) => {
  return (
    <>
      {/* <div>in BLOCKS (outside loop): {props.blocks[0].columns}</div> */}
      {props.x.content.blocks.map((block) => (
        <Fragment key={'render-block-' + block}>
          <Columns block={block} />
        </Fragment>
      ))}
    </>
  );
});

export default Blocks;
