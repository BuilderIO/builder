import { componentInfo } from './component-info.js';
import { useMetadata } from '@builder.io/mitosis';

export default function Text(props: { text: string }) {
  return <div class="builder-text" innerHTML={props.text} />;
}
