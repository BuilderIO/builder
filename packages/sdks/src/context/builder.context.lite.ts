import { createContext } from '@builder.io/mitosis';
import type { BuilderContextInterface } from './types.js';

export default createContext<BuilderContextInterface>(
  {
    content: null,
    context: {},
    localState: undefined,
    rootSetState: () => {},
    rootState: {},
    apiKey: null,
    apiVersion: undefined,
    inheritedStyles: {},
    BlocksWrapper: 'div',
    BlocksWrapperProps: {},
    nonce: '',
    model: '',
  },
  { reactive: true }
);
