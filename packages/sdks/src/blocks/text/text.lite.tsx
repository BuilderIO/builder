import { useTarget } from '@builder.io/mitosis';

export default function Text(props: { text?: string }) {
  return (
    <span
      class={
        /* NOTE: This class name must be "builder-text" for inline editing to work in the Builder editor */
        'builder-text'
      }
      innerHTML={props.text?.toString() || ''}
      style={{ outline: 'none' }}
      {...useTarget({
        reactNative: {
          dataSet: { 'builder-text': 'true' },
        },
        default: {},
      })}
    />
  );
}
