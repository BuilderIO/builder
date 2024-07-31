import type { BuilderBlock } from '../../types/builder-block';
import type { BuilderComponentsProp, BuilderDataProps, BuilderLinkComponentProp } from '../../types/builder-props';
export interface TabsProps extends BuilderComponentsProp, BuilderLinkComponentProp, BuilderDataProps {
  tabs: {
    label: BuilderBlock[];
    content: BuilderBlock[];
  }[];
  builderBlock: BuilderBlock;
  defaultActiveTab?: number;
  collapsible?: boolean;
  tabHeaderLayout?: 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  activeTabStyle?: any;
}