import { isBrowser } from './is-browser';

// TODO
export type ComponentInfo = any;

export const components: Record<string, any> = {};

// Compile only facade
export function registerComponent(component: any, info?: ComponentInfo): void {
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

function prepareComponentInfoToSend(info: ComponentInfo) {
  return {
    ...info,
    ...(info.inputs && {
      inputs: info.inputs.map((input: any) => {
        // TODO: do for nexted fields too
        // TODO: probably just convert all functions, not just
        // TODO: put this in input hooks: { onChange: ..., showIf: ... }
        const keysToConvertFnToString = ['onChange', 'showIf'];

        for (const key of keysToConvertFnToString) {
          if (input[key] && typeof input[key] === 'function') {
            const fn = input[key];
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
