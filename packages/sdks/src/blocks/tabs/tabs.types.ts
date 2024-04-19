import type { BuilderBlock } from '../../types/builder-block.js';

export interface TabsProps {
  tabs: {
    label: BuilderBlock[];
    content: BuilderBlock[];
  }[];
  builderBlock: BuilderBlock;
  defaultActiveTab?: number;
  collapsible?: boolean;
  tabHeaderLayout?:
    | 'center'
    | 'flex-start'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  activeTabStyle?: any;
}
