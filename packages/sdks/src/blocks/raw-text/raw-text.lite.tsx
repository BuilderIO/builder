import { componentInfo } from './component-info.js';
import { useMetadata } from '@builder.io/mitosis';

export interface RawTextProps {
  attributes?: any;
  text?: string;
  // builderBlock?: any;
}

export default function RawText(props: RawTextProps) {
  return (
    <span
      class={props.attributes?.class || props.attributes?.className}
      innerHTML={props.text || ''}
    />
  );
}
