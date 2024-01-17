import { Show } from '@builder.io/mitosis';

export default function Link(props: { LinkComponent: any; attributes: any }) {
  return (
    <Show when={props.LinkComponent} else={<a {...props.attributes} />}>
      <props.LinkComponent {...props.attributes} />
    </Show>
  );
}
