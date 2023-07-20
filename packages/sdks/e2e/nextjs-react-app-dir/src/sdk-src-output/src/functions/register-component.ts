import type { RegisteredComponent } from '../context/types';
import type { ComponentInfo } from '../types/components';
import type { Input } from '../types/input';
import { fastClone } from './fast-clone';

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

export const createRegisterComponentMessage = (info: ComponentInfo) => ({
  type: 'builder.registerComponent',
  data: info,
});

// eslint-disable-next-line @typescript-eslint/ban-types
const serializeFn = (fnValue: Function) => {
  const fnStr = fnValue.toString().trim();

  // we need to account for a few different fn syntaxes:
  // 1. `function name(args) => {code}`
  // 2. `name(args) => {code}`
  // 3. `(args) => {}`
  const appendFunction =
    !fnStr.startsWith('function') && !fnStr.startsWith('(');

  return `return (${
    appendFunction ? 'function ' : ''
  }${fnStr}).apply(this, arguments)`;
};

const serializeValue = (value: object): any =>
  typeof value === 'function' ? serializeFn(value) : fastClone(value);

export const serializeComponentInfo = ({
  inputs,
  ...info
}: ComponentInfo): ComponentInfo => ({
  ...fastClone(info),
  inputs: inputs?.map((input) =>
    Object.entries(input).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: serializeValue(value),
      }),
      {} as Input
    )
  ),
});
