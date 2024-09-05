import type { BuilderContextInterface, RegisteredComponents } from '../../context/types';
import type { BlocksWrapperProps } from './blocks-wrapper.vue';
export type BlocksProps = Partial<Omit<BlocksWrapperProps, 'BlocksWrapper' | 'BlocksWrapperProps'>> & {
  context?: BuilderContextInterface;
  registeredComponents?: RegisteredComponents;
  linkComponent?: any;
}