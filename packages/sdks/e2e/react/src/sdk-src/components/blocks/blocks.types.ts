import type { BuilderContextInterface, RegisteredComponents } from '../../context/types.js';
import type { BlocksWrapperProps } from './blocks-wrapper';
export type BlocksProps = Partial<Omit<BlocksWrapperProps, 'BlocksWrapper' | 'BlocksWrapperProps'>> & {
  context?: BuilderContextInterface;
  registeredComponents?: RegisteredComponents;
}