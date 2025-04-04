import type { BuilderBlock } from '../../types/builder-block.js';
import type {
  BuilderComponentsProp,
  BuilderDataProps,
} from '../../types/builder-props.js';
import type { Query } from './helpers.js';

export type PersonalizationContainerProps = {
  children?: any;
  attributes?: any;
  previewingIndex?: number | null;
  variants?: Array<{
    blocks: BuilderBlock[];
    query: Query[];
    startDate?: string;
    endDate?: string;
  }>;
} & BuilderDataProps &
  BuilderComponentsProp;
