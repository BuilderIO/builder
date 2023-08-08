import { useMetadata, Show, useTarget } from '@builder.io/mitosis';
import { filterAttrs } from '../helpers.js';
/**
 * This import is used by the Svelte SDK. Do not remove.
 */
// eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
import { setAttrs } from '../helpers.js';

useMetadata({
  rsc: {
    componentType: 'client',
  },
});

export interface ButtonProps {
  attributes?: any;
  text?: string;
  link?: string;
  openLinkInNewTab?: boolean;
}

export default function Button(props: ButtonProps) {
  return (
    <Show
      when={props.link}
      else={
        <button
          {...useTarget({
            vue2: filterAttrs(props.attributes, 'v-on:', false),
            vue3: filterAttrs(props.attributes, 'v-on:', false),
            svelte: filterAttrs(props.attributes, 'on:', false),
            default: {},
          })}
          {...useTarget({
            vue2: filterAttrs(props.attributes, 'v-on:', true),
            vue3: filterAttrs(props.attributes, 'v-on:', true),
            svelte: filterAttrs(props.attributes, 'on:', true),
            default: props.attributes,
          })}
          css={{ all: 'unset' }}
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
          style={props.attributes.style}
        >
          {props.text}
        </button>
      }
    >
      <a
        {...useTarget({
          vue2: filterAttrs(props.attributes, 'v-on:', false),
          vue3: filterAttrs(props.attributes, 'v-on:', false),
          svelte: filterAttrs(props.attributes, 'on:', false),
          default: {},
        })}
        {...useTarget({
          vue2: filterAttrs(props.attributes, 'v-on:', true),
          vue3: filterAttrs(props.attributes, 'v-on:', true),
          svelte: filterAttrs(props.attributes, 'on:', true),
          default: props.attributes,
        })}
        role="button"
        href={props.link}
        target={props.openLinkInNewTab ? '_blank' : undefined}
      >
        {props.text}
      </a>
    </Show>
  );
}
