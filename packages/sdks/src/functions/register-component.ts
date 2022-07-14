import { RegisteredComponent } from '../context/builder.context.lite';
import type { ComponentInfo, Input } from '../types/components.js';

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
  data: prepareComponentInfoToSend(info),
});

/**
 * Input attributes that are functions must be converted to strings before being serialized to JSON.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
const serializeFn = (fn: Function) =>
  `return (${fn.toString()}).apply(this, arguments)`;

const prepareComponentInfoToSend = (info: ComponentInfo): ComponentInfo => ({
  ...info,
  inputs: info.inputs?.map(
    (input): Input =>
      Object.entries(input).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: typeof value === 'function' ? serializeFn(value) : value,
        }),
        {} as Input
      )
  ),
});
