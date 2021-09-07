import { registerComponent } from '../functions/register-component';

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

registerComponent({
  name: 'Builder:RawText',
  hideFromInsertMenu: true,
  builtIn: true,
  inputs: [
    {
      name: 'text',
      bubble: true,
      type: 'longText',
      required: true,
    },
  ],
});
