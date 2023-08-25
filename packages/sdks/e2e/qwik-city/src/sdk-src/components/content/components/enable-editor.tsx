import { Slot, component$ } from '@builder.io/qwik';

const MODIFIED_COLUMNS = {
  data: {
    blocks: [
      {
        columns: ['updated text!'],
      },
    ],
  },
};

export const EnableEditor = component$((props) => {
  return (
    <>
      <button
        onClick$={() => {
          const newContentValue = {
            ...props.builderContextSignal.content,
            ...MODIFIED_COLUMNS,
          };
          console.log('newContentValue', newContentValue);

          props.builderContextSignal.content = newContentValue;
        }}
      >
        update me
      </button>
      <Slot></Slot>
    </>
  );
});

export default EnableEditor;
