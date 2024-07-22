import type { BuilderBlock } from '../../types/builder-block.js';
import type {
  BuilderComponentsProp,
  BuilderDataProps,
  BuilderLinkComponentProp,
  BuilderNonceProp,
} from '../../types/builder-props.js';

export interface TabsProps
  extends BuilderComponentsProp,
    BuilderLinkComponentProp,
    BuilderDataProps,
    BuilderNonceProp {
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
