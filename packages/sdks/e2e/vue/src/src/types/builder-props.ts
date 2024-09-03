import type { BuilderContextInterface, RegisteredComponents } from '../context/types';
import type { BuilderBlock } from './builder-block';
export type BuilderDataProps = {
  builderBlock: BuilderBlock;
  builderContext: BuilderContextInterface;
};
export type BuilderComponentsProp = {
  builderComponents: RegisteredComponents;
};
export type BuilderLinkComponentProp = {
  builderLinkComponent?: any;
};
export type BuilderNonceProp = {
  nonce: string;
}