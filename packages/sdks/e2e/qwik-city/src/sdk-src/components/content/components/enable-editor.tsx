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
            data: {
              ...props.builderContextSignal.content?.data,
              ...MODIFIED_COLUMNS?.data,
            },
            meta: {
              ...props.builderContextSignal.content?.meta,
              ...MODIFIED_COLUMNS?.meta,
              breakpoints:
                MODIFIED_COLUMNS?.meta?.breakpoints ||
                props.builderContextSignal.content?.meta?.breakpoints,
            },
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
