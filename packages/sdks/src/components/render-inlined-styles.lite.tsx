import { TARGET } from '../constants/target';
import { Fragment, Show, useState } from '@builder.io/mitosis';

interface Props {
  styles: string;
}

export default function RenderInlinedStyles(props: Props) {
  const state = useState({
    get injectedStyleScript(): string {
      return `<${state.tagName}>${props.styles}</${state.tagName}>`;
    },
    get tagName(): string {
      // NOTE: we have to obfusctate the name of the tag due to a limitation in the svelte-preprocessor plugin.
      // https://github.com/sveltejs/vite-plugin-svelte/issues/315#issuecomment-1109000027
      return 'sty' + 'le';
    },
  });

  return (
    <Show
      when={TARGET === 'svelte'}
      else={<state.tagName>{props.styles}</state.tagName>}
    >
      <Fragment innerHTML={state.injectedStyleScript} />
    </Show>
  );
}
