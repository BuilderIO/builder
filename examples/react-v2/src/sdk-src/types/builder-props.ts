import type { BuilderContextInterface, RegisteredComponents } from '../context/types.js';
import type { BuilderBlock } from './builder-block.js';
export type BuilderDataProps = {
  builderBlock: BuilderBlock;
  builderContext: BuilderContextInterface;
};
export type BuilderComponentsProp = {
  builderComponents: RegisteredComponents;
};
export type BuilderLinkComponentProp = {
  builderLinkComponent?: any;
}