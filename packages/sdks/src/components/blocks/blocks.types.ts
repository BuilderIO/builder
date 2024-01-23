import type { Signal } from '@builder.io/mitosis';
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '../../context/types.js';
import type { BlocksWrapperProps } from './blocks-wrapper.lite';

export type BlocksProps = Partial<
  Omit<BlocksWrapperProps, 'BlocksWrapper' | 'BlocksWrapperProps'>
> & {
  context?: Signal<BuilderContextInterface>;
  registeredComponents?: RegisteredComponents;
  linkComponent?: any;
};
