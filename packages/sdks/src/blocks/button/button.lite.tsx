import { Show } from '@builder.io/mitosis';

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
        <button css={{ all: 'unset' }} {...props.attributes}>
          {props.text}
        </button>
      }
    >
      <a
        {...props.attributes}
        role="button"
        href={props.link}
        target={props.openLinkInNewTab ? '_blank' : undefined}
      >
        {props.text}
      </a>
    </Show>
  );
}
