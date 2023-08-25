import { Slot, component$ } from '@builder.io/qwik';

const MODIFIED_COLUMNS = {
  data: {
    blocks: [
      {
        id: 'builder-1253ebf62a87451db1a31e103189b5bb',
        columns: ['updated text!'],
      },
    ],
  },
  id: 'f24c6940ee5f46458369151cc9ec598c',
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
