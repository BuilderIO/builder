import { serializeFn } from '../blocks/util.js';
import type { RegisteredComponent } from '../context/types.js';
import type { ComponentInfo, Input } from '../types/components.js';
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
  data: prepareComponentInfoToSend(info),
});

const serializeValue = (value: object): any =>
  typeof value === 'function' ? serializeFn(value) : fastClone(value);

const prepareComponentInfoToSend = ({
  inputs,
  ...info
}: ComponentInfo): ComponentInfo => ({
  ...fastClone(info),
  inputs: inputs?.map(
    (input): Input =>
      Object.entries(input).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: serializeValue(value),
        }),
        {} as Input
      )
  ),
});
