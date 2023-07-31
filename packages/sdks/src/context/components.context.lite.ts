import { createContext } from '@builder.io/mitosis';
import type { RegisteredComponents } from './types.js';

type ComponentsContext = {
  registeredComponents: RegisteredComponents;
};

export default createContext<ComponentsContext>({
  registeredComponents: {},
});
