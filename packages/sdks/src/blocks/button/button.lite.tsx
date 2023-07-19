import { Show, useTarget } from '@builder.io/mitosis';
import { filterAttrs } from '../helpers';

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
            vue2: {
              ...filterAttrs(props.attributes, 'v-on:', true),
              ...filterAttrs(props.attributes, 'v-on:', false),
            },
            vue3: {
              ...filterAttrs(props.attributes, 'v-on:', true),
              ...filterAttrs(props.attributes, 'v-on:', false),
            },
            svelte: {
              ...filterAttrs(props.attributes, 'on:', true),
              ...filterAttrs(props.attributes, 'on:', false),
            },
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
          vue2: {
            ...filterAttrs(props.attributes, 'v-on:', true),
            ...filterAttrs(props.attributes, 'v-on:', false),
          },
          vue3: {
            ...filterAttrs(props.attributes, 'v-on:', true),
            ...filterAttrs(props.attributes, 'v-on:', false),
          },
          svelte: {
            ...filterAttrs(props.attributes, 'on:', true),
            ...filterAttrs(props.attributes, 'on:', false),
          },
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
