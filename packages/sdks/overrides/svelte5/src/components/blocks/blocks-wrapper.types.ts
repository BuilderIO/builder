import type { BuilderBlock } from '../../types/builder-block.js';

export type BlocksWrapperProps = {
  blocks: BuilderBlock[] | undefined;
  parent: string | undefined;
  path: string | undefined;
  styleProp: Record<string, any> | undefined;
  BlocksWrapper: any;
  BlocksWrapperProps: any;
  children?: any;
  classNameProp?: string;
};
