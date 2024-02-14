import { useMetadata, useTarget } from '@builder.io/mitosis';
import DynamicRenderer from '../../components/dynamic-renderer/dynamic-renderer.lite.jsx';
import { getClassPropName } from '../../functions/get-class-prop-name.js';
import { filterAttrs } from '../helpers.js';
import type { ButtonProps } from './button.types.js';

useMetadata({
  rsc: {
    componentType: 'client',
  },
});

export default function Button(props: ButtonProps) {
  return (
    <DynamicRenderer
      TagName={useTarget({
        reactNative: props.link
          ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            props.builderLinkComponent || BaseText
          : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            BaseText,
        default: props.link ? props.builderLinkComponent || 'a' : 'button',
      })}
      attributes={{
        ...useTarget({
          vue: filterAttrs(props.attributes, 'v-on:', false),
          svelte: filterAttrs(props.attributes, 'on:', false),
          default: props.attributes,
        }),
        [getClassPropName()]: `${props.link ? '' : 'builder-button'} ${
          props.attributes[getClassPropName()] || ''
        }`,
        ...(props.link
          ? {
              href: props.link,
              target: props.openLinkInNewTab ? '_blank' : undefined,
              role: 'link',
            }
          : { role: 'button' }),
      }}
      actionAttributes={useTarget({
        vue: filterAttrs(props.attributes, 'v-on:', true),
        svelte: filterAttrs(props.attributes, 'on:', true),
        default: {},
      })}
    >
      {props.text}
    </DynamicRenderer>
  );
}
