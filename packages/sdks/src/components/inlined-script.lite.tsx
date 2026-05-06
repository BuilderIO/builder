import { Show, useStore } from '@builder.io/mitosis';
import { isBrowser } from '../functions/is-browser.js';
import type { BuilderNonceProp } from '../types/builder-props.js';

interface Props extends BuilderNonceProp {
  scriptStr: string;
  id: string;
  dedupe?: boolean;
}

export default function InlinedScript(props: Props) {
  const state = useStore({
    get shouldRender() {
      return (
        !props.dedupe ||
        !isBrowser() ||
        !document.querySelector(`script[data-id="${props.id}"]`)
      );
    },
  });

  return (
    <Show when={state.shouldRender}>
      <script
        innerHTML={props.scriptStr}
        data-id={props.id}
        nonce={props.nonce || ''}
      />
    </Show>
  );
}
