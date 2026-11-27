import type { Signal } from '../../../types/signal.js';
import type { BuilderContextInterface } from '../../../context/types.js';
import type { BuilderBlock } from '../../../types/builder-block.js';

export type InteractiveElementProps = {
  Wrapper: any;
  block: BuilderBlock;
  context: Signal<BuilderContextInterface>;
  wrapperProps: { [index: string]: any };
  includeBlockProps: boolean;
};
