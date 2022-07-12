import { RegisteredComponent } from '../context/builder.context.lite';
import type { ComponentInfo } from '../types/components.js';
import { fastClone } from './fast-clone.js';

/**
 * @deprecated.  Use the `customComponents` prop in RenderContent instead to provide your custom components to the builder SDK.
 */
export const components: RegisteredComponent[] = [];

/**
 * @deprecated.  Use the `customComponents` prop in RenderContent instead to provide your custom components to the builder SDK.
 */
export function registerComponent(component: any, info: ComponentInfo): void {
  components.push({ component, ...info });

  console.warn(
    'registerComponent is deprecated. Use the `customComponents` prop in RenderContent instead to provide your custom components to the builder SDK.'
  );

  return component;
}

export const createRegisterComponentMessage = ({
  component: _,
  ...info
}: RegisteredComponent) => ({
  type: 'builder.registerComponent',
  data: prepareComponentInfoToSend(fastClone(info)),
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
