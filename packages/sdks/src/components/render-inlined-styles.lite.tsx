import { TARGET } from '../constants/target.js';
import { Show, useStore, useMetadata } from '@builder.io/mitosis';

useMetadata({
  elementTag: 'state.tag',
});

interface Props {
  styles: string;
}

export default function RenderInlinedStyles(props: Props) {
  const state = useStore({
    get tag(): string {
      // NOTE: we have to obfusctate the name of the tag due to a limitation in the svelte-preprocessor plugin.
      // https://github.com/sveltejs/vite-plugin-svelte/issues/315#issuecomment-1109000027
      return 'sty' + 'le';
    },
    get injectedStyleScript(): string {
      return `<${state.tag}>${props.styles}</${state.tag}>`;
    },
  });

  return (
    <Show
      when={TARGET === 'svelte' || TARGET === 'qwik'}
      else={
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <state.tag>{props.styles}</state.tag>
      }
    >
      {/**
       * We have a Svelte plugin that converts this `div` to a `Fragment`. We cannot directly use a "Fragment" here because
       * not all frameworks support providing properties to a "Fragment" (e.g. Solid)
       */}
      {/* 
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore */}
      <state.tag innerHTML={props.styles} />
    </Show>
  );
}
