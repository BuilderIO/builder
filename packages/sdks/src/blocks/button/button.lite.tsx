import { Show, useTarget } from '@builder.io/mitosis';
import { filterVueAttrs } from '../helpers';

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
              ...filterVueAttrs(props.attributes, true),
              ...filterVueAttrs(props.attributes, false),
            },
            vue3: {
              ...filterVueAttrs(props.attributes, true),
              ...filterVueAttrs(props.attributes, false),
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
            ...filterVueAttrs(props.attributes, true),
            ...filterVueAttrs(props.attributes, false),
          },
          vue3: {
            ...filterVueAttrs(props.attributes, true),
            ...filterVueAttrs(props.attributes, false),
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
