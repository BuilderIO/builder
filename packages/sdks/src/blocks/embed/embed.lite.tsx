import {
  onUpdate,
  useMetadata,
  useRef,
  useStore,
  useTarget,
} from '@builder.io/mitosis';
import { isJsScript } from './helpers.js';

useMetadata({
  rsc: {
    componentType: 'client',
  },
});

export interface EmbedProps {
  content: string;
}

export default function Embed(props: EmbedProps) {
  const elem = useRef<HTMLDivElement>();

  const state = useStore({
    scriptsInserted: [] as string[],
    scriptsRun: [] as string[],
    ranInitFn: false,
    findAndRunScripts() {
      if (!elem || !elem.getElementsByTagName) return;
      const scripts = elem.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        if (script.src && !state.scriptsInserted.includes(script.src)) {
          state.scriptsInserted.push(script.src);
          const newScript = document.createElement('script');
          newScript.async = true;
          newScript.src = script.src;
          document.head.appendChild(newScript);
        } else if (
          isJsScript(script) &&
          !state.scriptsRun.includes(script.innerText)
        ) {
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
            console.warn('`Embed`: Error running script:', error);
          }
        }
      }
    },
  });

  onUpdate(() => {
    if (elem && !state.ranInitFn) {
      state.ranInitFn = true;
      state.findAndRunScripts();
    }
  }, [elem, state.ranInitFn]);

  return <div ref={elem} class="builder-embed" innerHTML={props.content}></div>;
}
