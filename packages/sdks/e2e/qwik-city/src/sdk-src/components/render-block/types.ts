import type { BuilderContextInterface } from '../../context/types.js';
import type { BuilderBlock } from '../../types/builder-block.js';

export interface RepeatData {
  block: BuilderBlock;
  context: BuilderContextInterface;
}
