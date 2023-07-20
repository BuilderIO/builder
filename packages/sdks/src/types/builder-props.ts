import type { Signal } from '@builder.io/mitosis';
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '../context/types';
import type { BuilderBlock } from './builder-block';

export type PropsWithBuilderData<T> = T & {
  builderBlock: BuilderBlock;
  builderContext: Signal<BuilderContextInterface>;
};

export type BuilderComponentsProp = {
  builderComponents: RegisteredComponents;
};
