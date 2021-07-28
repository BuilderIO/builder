import { useState, useRef, onMount } from '@builder.io/mitosis';
import { registerComponent } from '../functions/register-component';

export interface CustomCodeProps {
  code: string;
  replaceNodes?: boolean;
}

export default function CustomCode(props: CustomCodeProps) {
  const elem = useRef();

  const state = useState({
    scriptsInserted: [] as string[],
    scriptsRun: [] as string[],

    findAndRunScripts() {
      // TODO: Move this function to standalone one in '@builder.io/utils'
      if (elem && typeof window !== 'undefined') {
        /** @type {HTMLScriptElement[]} */
        const scripts = elem.getElementsByTagName('script');
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
            ['text/javascript', 'application/javascript', 'application/ecmascript'].includes(
              script.type
            )
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
      }
    },
  });

  onMount(() => {
    state.findAndRunScripts();
  });

  return (
    <div
      ref={elem}
      class={'builder-custom-code' + (props.replaceNodes ? ' replace-nodes' : '')}
      innerHTML={props.code}
    ></div>
  );
}

registerComponent({
  name: 'Custom Code',
  static: true,
  requiredPermissions: ['editCode'],
  inputs: [
    {
      name: 'code',
      type: 'html',
      required: true,
      defaultValue: '<p>Hello there, I am custom HTML code!</p>',
      code: true,
    },
    {
      name: 'replaceNodes',
      type: 'boolean',
      helperText: 'Preserve server rendered dom nodes',
      advanced: true,
    },
    {
      name: 'scriptsClientOnly',
      type: 'boolean',
      defaultValue: false,
      helperText:
        'Only print and run scripts on the client. Important when scripts influence DOM that could be replaced when client loads',
      advanced: true,
    },
  ],
});
