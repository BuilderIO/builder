import {
  onMount,
  onUpdate,
  useMetadata,
  useRef,
  useStore,
  useTarget,
} from '@builder.io/mitosis';
import { isEditing } from '../../functions/is-editing.js';
import { logger } from '../../helpers/logger.js';

useMetadata({
  rsc: {
    componentType: 'client',
  },
  angular: {
    changeDetection: 'OnPush',
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
    runScripts: () => {
      if (
        !elementRef ||
        !elementRef?.getElementsByTagName ||
        typeof window === 'undefined'
      ) {
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
            useTarget({
              angular: () => {
                requestAnimationFrame(() => {
                  state.scriptsRun.push(script.innerText);
                  new Function(script.innerText)();
                });
              },
              default: () => {
                state.scriptsRun.push(script.innerText);
                new Function(script.innerText)();
              },
            });
          } catch (error) {
            logger.warn(
              '[BUILDER.IO] `CustomCode`: Error running script:',
              error
            );
          }
        }
      }
    },
  });

  onMount(() => {
    state.runScripts();
  });

  onUpdate(() => {
    if (isEditing()) {
      useTarget({
        svelte: () => {
          setTimeout(() => {
            state.runScripts();
          }, 0);
        },
        vue: () => {
          setTimeout(() => {
            state.runScripts();
          }, 0);
        },
        default: () => {
          state.runScripts();
        },
      });
    }
  }, [props.code]);

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
