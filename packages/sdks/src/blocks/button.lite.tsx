import { Show } from '@builder.io/mitosis';
import { registerComponent } from '../functions/register-component';

export interface ButtonProps {
  attributes?: any;
  text?: string;
  link?: string;
  openLinkInNewTab?: boolean;
}

export default function Button(props: ButtonProps) {
  return (
    <>
      <Show when={props.link}>
        <a
          {...props.attributes}
          href={props.link}
          target={props.openLinkInNewTab ? '_blank' : undefined}
        >
          {props.text}
        </a>
      </Show>
      <Show when={!props.link}>
        <button {...props.attributes} type="button">
          {props.text}
        </button>
      </Show>
    </>
  );
}

registerComponent({
  name: 'Core:Button',
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2F81a15681c3e74df09677dfc57a615b13',
  defaultStyles: {
    // TODO: make min width more intuitive and set one
    appearance: 'none',
    paddingTop: '15px',
    paddingBottom: '15px',
    paddingLeft: '25px',
    paddingRight: '25px',
    backgroundColor: '#3898EC',
    color: 'white',
    borderRadius: '4px',
    textAlign: 'center',
    cursor: 'pointer',
  },
  inputs: [
    {
      name: 'text',
      type: 'text',
      defaultValue: 'Click me!',
      bubble: true,
    },
    {
      name: 'link',
      type: 'url',
      bubble: true,
    },
    {
      name: 'openLinkInNewTab',
      type: 'boolean',
      defaultValue: false,
      friendlyName: 'Open link in new tab',
    },
  ],
  static: true,
  noWrap: true,
});
