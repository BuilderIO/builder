import type {
  BuilderContextInterface,
  RegisteredComponent,
} from '../context/types';
import type { BuilderBlock } from './builder-block';
import type { Dictionary } from './typescript';

export type PropsWithBuilderData<T> = T & {
  builderBlock: BuilderBlock;
  builderContext: BuilderContextInterface;
};

export type BuilderComponentsProp = {
  builderComponents: Dictionary<RegisteredComponent>;
};
