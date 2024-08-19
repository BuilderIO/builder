import { onMount, useMetadata, useRef, useStore } from '@builder.io/mitosis';
import type { BuilderDataProps } from '../../types/builder-props';

useMetadata({
  rsc: {
    componentType: 'client',
  },
});

export interface CustomCodeProps {
  code: string;
  replaceNodes?: boolean;
  builderContext: BuilderDataProps['builderContext'];
}

export default function CustomCode(props: CustomCodeProps) {
  const elementRef = useRef<HTMLDivElement>();

  const state = useStore({
    scriptsInserted: [] as string[],
    scriptsRun: [] as string[],
  });

  onMount(() => {
    // TODO: Move this function to standalone one in '@builder.io/utils'
    if (!elementRef?.getElementsByTagName || typeof window === 'undefined') {
      return;
    }

    const scripts = elementRef.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      if (script.src) {
        if (state.scriptsInserted.includes(script.src)) {
          continue;
        }
        state.scriptsInserted.push(script.src);
        const newScript = document.createElement('script');
        newScript.async = true;
        newScript.src = script.src;
        if (props.builderContext.value.nonce) {
          newScript.setAttribute('nonce', props.builderContext.value.nonce);
        }
        document.head.appendChild(newScript);
      } else if (
        !script.type ||
        [
          'text/javascript',
          'application/javascript',
          'application/ecmascript',
        ].includes(script.type)
      ) {
        if (state.scriptsRun.includes(script.innerText)) {
          continue;
        }
        try {
          if (props.builderContext.value.nonce) {
            script.setAttribute('nonce', props.builderContext.value.nonce);
          }
          state.scriptsRun.push(script.innerText);
          new Function(script.innerText)();
        } catch (error) {
          console.warn('`CustomCode`: Error running script:', error);
        }
      }
    }

    if (props.builderContext.value.nonce) {
      const styles = elementRef.getElementsByTagName('style');
      for (let i = 0; i < styles.length; i++) {
        const style = styles[i];
        style.setAttribute('nonce', props.builderContext.value.nonce);
      }
    }
  });

  return (
    <div
      ref={elementRef}
      class={
        'builder-custom-code' + (props.replaceNodes ? ' replace-nodes' : '')
      }
      innerHTML={props.code}
    ></div>
  );
}
