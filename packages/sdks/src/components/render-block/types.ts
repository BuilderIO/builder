import { BuilderContextInterface } from '../../context/builder.context.lite';
import { BuilderBlock } from '../../types/builder-block.js';

export interface RepeatData {
  block: BuilderBlock;
  context: BuilderContextInterface;
}
