import type { Writable } from "svelte/store";
import type { BuilderContextInterface, RegisteredComponents } from '../context/types.js';
import type { BuilderBlock } from './builder-block.js';
export type PropsWithBuilderData<T> = T & {
  builderBlock: BuilderBlock;
  builderContext: Writable<BuilderContextInterface>;
};
export type BuilderComponentsProp = {
  builderComponents: RegisteredComponents;
}