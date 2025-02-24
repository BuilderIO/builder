import { useMetadata } from '@builder.io/mitosis';
import type { TextProps } from './text.types.js';

useMetadata({
  angular: {
    changeDetection: 'OnPush',
  },
});

export default function Text(props: TextProps) {
  return (
    <div
      class={
        /* NOTE: This class name must be "builder-text" for inline editing to work in the Builder editor */
        'builder-text'
      }
      innerHTML={props.text?.toString() || ''}
      style={{ outline: 'none' }}
    />
  );
}
