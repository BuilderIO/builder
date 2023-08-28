import { Slot, component$, useStore, Fragment } from '@builder.io/qwik';

type Columns = Array<string>;

type Content = {
  blocks: Array<{
    columns: Columns;
  }>;
};

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

const MODIFIED_COLUMNS: Content = { blocks: [{ columns: ['updated text!'] }] };

export const EnableEditor = component$(
  (props: { context: { content: Content } }) => {
    return (
      <>
        <button
          onClick$={() => {
            const newContentValue = {
              ...props.context.content,
              ...MODIFIED_COLUMNS,
            };
            props.context.content = newContentValue;
          }}
        >
          update me
        </button>
        <Slot></Slot>
      </>
    );
  }
);

export const Columns = component$((props: { columns: Columns }) => {
  return <div>in Columns: {props.columns[0]}</div>;
});

export const Blocks = component$((props: { content: Content }) => {
  return (
    <>
      <div>outside loop: {JSON.stringify(props.content.blocks[0].columns)}</div>
      {props.content.blocks.map((block) => {
        return (
          <Fragment key={'render-block-' + block}>
            {/* uncomment this to fix  */}
            {/* <div>in BLOCKS (inside loop): {JSON.stringify(block.columns)}</div> */}
            <Columns columns={block.columns} />
          </Fragment>
        );
      })}
    </>
  );
});

export const ContentComponent = component$((props: { content: Content }) => {
  const state = useStore(
    { context: { content: clone(props.content) } },
    { deep: true }
  );

  return (
    <EnableEditor context={state.context}>
      <Blocks content={state.context.content}></Blocks>
    </EnableEditor>
  );
});

export default component$(() => (
  <ContentComponent
    content={{ blocks: [{ columns: ['<p>text in column 1</p>'] }] }}
  />
));
