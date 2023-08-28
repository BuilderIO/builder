import { Slot, component$ } from '@builder.io/qwik';
import type { Content } from '../content.types';

const MODIFIED_COLUMNS: Content = {
  blocks: [
    {
      columns: ['updated text!'],
    },
  ],
};

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
            console.log('newContentValue', newContentValue);

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

export default EnableEditor;
