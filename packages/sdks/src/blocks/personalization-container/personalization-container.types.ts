import type { Query } from '../../functions/filter-with-custom-targeting.js';
import type { BuilderBlock } from '../../types/builder-block.js';
import type { BuilderDataProps } from '../../types/builder-props.js';

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
} & BuilderDataProps;
