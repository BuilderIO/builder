import { useTarget } from '@builder.io/mitosis';

export default function Text(props: { text?: string }) {
  return (
    <span
      class="builder-text"
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
