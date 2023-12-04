import { onMount, useMetadata, useRef, useStore } from '@builder.io/mitosis';

useMetadata({
  rsc: {
    componentType: 'client',
  },
});

export interface CustomCodeProps {
  code: string;
  replaceNodes?: boolean;
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
          state.scriptsRun.push(script.innerText);
          new Function(script.innerText)();
        } catch (error) {
          console.warn('`CustomCode`: Error running script:', error);
        }
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
