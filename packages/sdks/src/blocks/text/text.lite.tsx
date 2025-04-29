import { useMetadata } from '@builder.io/mitosis';
import { resolveLocalizedText } from '../helpers.js';
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
      innerHTML={resolveLocalizedText(props.text, props.locale)}
      style={{ outline: 'none' }}
    />
  );
}
