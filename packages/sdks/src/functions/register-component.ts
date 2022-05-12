import { RegisteredComponent } from '../context/builder.context.lite.js';
import type { ComponentInfo, Input } from '../types/components.js';
import { isBrowser } from './is-browser.js';

export const components: Record<
  string,
  { component: any; info?: ComponentInfo }
> = {};

// Compile only facade
export function registerComponent(component: any, info: ComponentInfo): void {
  components[info.name] = { component, info };

  if (isBrowser()) {
    const sendInfo = prepareComponentInfoToSend(info);
    window.parent?.postMessage(
      {
        type: 'builder.registerComponent',
        data: sendInfo,
      },
      '*'
    );
  }

  return component;
}

export const createRegisterComponentMessage = ({
  info,
}: RegisteredComponent) => ({
  type: 'builder.registerComponent',
  data: prepareComponentInfoToSend(info),
});

function prepareComponentInfoToSend(info: ComponentInfo) {
  return {
    ...info,
    ...(info.inputs && {
      inputs: info.inputs.map((input) => {
        // TODO: do for nexted fields too
        // TODO: probably just convert all functions, not just
        // TODO: put this in input hooks: { onChange: ..., showIf: ... }
        const keysToConvertFnToString = ['onChange', 'showIf'] as const;

        for (const key of keysToConvertFnToString) {
          const fn = input[key];
          if (fn && typeof fn === 'function') {
            input = {
              ...input,
              [key]: `return (${fn.toString()}).apply(this, arguments)`,
            };
          }
        }

        return input;
      }),
    }),
  };
}
