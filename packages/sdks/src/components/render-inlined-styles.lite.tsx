import { TARGET } from '../constants/target.js';
import { Show, useStore } from '@builder.io/mitosis';

interface Props {
  styles: string;
}

export default function RenderInlinedStyles(props: Props) {
  const state = useStore({
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
      else={
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <state.tagName>{props.styles}</state.tagName>
      }
    >
      {/**
       * We have a Svelte plugin that converts this `div` to a `Fragment`. We cannot directly use a "Fragment" here because
       * not all frameworks support providing properties to a "Fragment" (e.g. Solid)
       */}
      <div innerHTML={state.injectedStyleScript} />
    </Show>
  );
}
