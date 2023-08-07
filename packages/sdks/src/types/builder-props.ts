import type { Signal } from '@builder.io/mitosis';
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '../context/types.js';
import type { BuilderBlock } from './builder-block.js';
import type { Executor } from '../functions/evaluate/helpers.js';

export type PropsWithBuilderData<T> = T & {
  builderBlock: BuilderBlock;
};

/**
 * Props needed to be able to render a Builder Content tree.
 */
export type BuilderRenderingOptions = {
  context: Signal<BuilderContextInterface>;
  components: RegisteredComponents;
  serverExecutor?: Executor;
};

/**
 * Props needed to be able to render a Builder Content tree. prefixed with `builder`.
 * This is used to pass these props through Builder Blocks like Columns, Symbol, etc.
 */
export type BuilderRenderingOptionsProps = {
  [T in keyof BuilderRenderingOptions as T extends string
    ? `builder${Capitalize<T>}`
    : never]: BuilderRenderingOptions[T];
};
