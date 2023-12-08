import * as React from 'react';

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

export interface ButtonProps {
  attributes?: any;
  text?: string;
  link?: string;
  openLinkInNewTab?: boolean;
}

import { setAttrs } from '../helpers';

function Button(props: ButtonProps) {
  return (
    <>
      {props.link ? (
        <>
          <a
            {...{}}
            {...props.attributes}
            href={props.link}
            target={props.openLinkInNewTab ? '_blank' : undefined}
            role={'button'}
          >
            {props.text}
          </a>
        </>
      ) : (
        <>
          <button
            {...{}}
            {...props.attributes}
            style={props.attributes.style}
            className={props.attributes.className + ' button-5294b10c'}
          >
            {props.text}
          </button>
        </>
      )}

      <style>{`.button-5294b10c {
  all: unset;
}`}</style>
    </>
  );
}

export default Button;
