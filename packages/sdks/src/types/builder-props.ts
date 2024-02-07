import type { Signal } from '@builder.io/mitosis';
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '../context/types.js';
import type { BuilderBlock } from './builder-block.js';

export type BuilderDataProps = {
  builderBlock: BuilderBlock;
  builderContext: Signal<BuilderContextInterface>;
};

export type BuilderComponentsProp = {
  builderComponents: RegisteredComponents;
};

export type BuilderLinkComponentProp = {
  builderLinkComponent?: any;
};
