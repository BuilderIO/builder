import { componentInfo } from './component-info';
import { useMetadata } from '@builder.io/mitosis';

export default function Text(props: { text: string }) {
  return <div class="builder-text" innerHTML={props.text} />;
}

useMetadata({ componentInfo });
