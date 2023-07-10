import type { BuilderContextInterface } from '../context/types';
import type { BuilderBlock } from './builder-block';

export type PropsWithBuilder<T> = T & {
  builderBlock: BuilderBlock;
  builderContext: BuilderContextInterface;
};
