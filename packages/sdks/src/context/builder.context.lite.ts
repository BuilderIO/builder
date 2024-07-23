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
    componentInfos: {},
    inheritedStyles: {},
    BlocksWrapper: 'div',
    BlocksWrapperProps: {},
    nonce: '',
  },
  { reactive: true }
);
