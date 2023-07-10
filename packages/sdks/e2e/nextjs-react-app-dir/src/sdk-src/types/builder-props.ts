import { BuilderContextInterface } from '../context/types';
import { BuilderBlock } from './builder-block';

export type PropsWithBuilder<T> = T & {
  builderBlock: BuilderBlock;
  builderContext: BuilderContextInterface;
};
