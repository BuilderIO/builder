import { useMetadata, useTarget } from '@builder.io/mitosis';
import { filterAttrs } from '../helpers.js';
/**
 * This import is used by the Svelte SDK. Do not remove.
 */

import DynamicRenderer from '../../components/dynamic-renderer/dynamic-renderer.lite.jsx';
import { setAttrs } from '../helpers.js';
import type { ButtonProps } from './button.types.js';

useMetadata({
  rsc: {
    componentType: 'client',
  },
});

export default function Button(props: ButtonProps) {
  return (
    <DynamicRenderer
      TagName={props.link ? props.LinkComponent || 'a' : 'button'}
      attributes={{
        class: `${props.link ? '' : 'builder-button'} ${useTarget({
          react: props.attributes.className,
          reactNative: props.attributes.className,
          rsc: props.attributes.className,
          default: props.attributes.class,
        })}`,
        ...(props.link
          ? {
              href: props.link,
              target: props.openLinkInNewTab ? '_blank' : undefined,
              role: 'link',
            }
          : { role: 'button' }),
        ...useTarget({
          vue: filterAttrs(props.attributes, 'v-on:', false),
          svelte: filterAttrs(props.attributes, 'on:', false),
          default: props.attributes,
        }),
      }}
      actionAttributes={useTarget({
        vue: filterAttrs(props.attributes, 'v-on:', true),
        svelte: filterAttrs(props.attributes, 'on:', true),
        default: {},
      })}
    />
  );
}
