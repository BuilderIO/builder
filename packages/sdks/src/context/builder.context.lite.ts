import { createContext } from '@builder.io/mitosis';
import type { BuilderContextInterface } from './types';

export default createContext<BuilderContextInterface>(
  {
    content: null,
    context: {},
    localState: undefined,
    rootSetState: () => {},
    rootState: {},
    apiKey: null,
    apiVersion: undefined,
    registeredComponents: {},
    inheritedStyles: {},
  },
  { reactive: true }
);
