import { useTarget } from '@builder.io/mitosis';

export interface RawTextProps {
  attributes?: any;
  text?: string;
}

export default function RawText(props: RawTextProps) {
  return (
    <div
      class={useTarget(
        /**
         * We have to explicitly provide `class` so that Mitosis knows to merge it with `css`.
         */
        {
          react: props.attributes.className,
          reactNative: props.attributes.className,
          rsc: props.attributes.className,
          default: props.attributes.class,
        }
      )}
      innerHTML={props.text?.toString() || ''}
    />
  );
}
