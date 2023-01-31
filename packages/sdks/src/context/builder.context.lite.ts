import { createContext } from '@builder.io/mitosis';
import type { BuilderContextInterface } from './types';

export default createContext<BuilderContextInterface>({
  content: null,
  context: {},
  state: {},
  setState: () => {},
  apiKey: null,
  registeredComponents: {},
  inheritedStyles: {},
});
