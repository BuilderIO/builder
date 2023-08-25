import { filterAttrs, setAttrs } from '../helpers';

import { Fragment, component$, h, useStylesScoped$ } from '@builder.io/qwik';

/**
 * This import is used by the Svelte SDK. Do not remove.
 */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
export interface ButtonProps {
  attributes?: any;
  text?: string;
  link?: string;
  openLinkInNewTab?: boolean;
}
export const Button = component$((props: ButtonProps) => {
  useStylesScoped$(STYLES);

  return (
    <>
      {props.link ? (
        <a
          role="button"
          {...{}}
          {...props.attributes}
          href={props.link}
          target={props.openLinkInNewTab ? '_blank' : undefined}
        >
          {props.text}
        </a>
      ) : (
        <button
          {...{}}
          {...props.attributes}
          style={props.attributes.style}
          class={props.attributes.class + ' button-Button'}
        >
          {props.text}
        </button>
      )}
    </>
  );
});

export default Button;

export const STYLES = `
.button-Button {
  all: unset;
}
`;
