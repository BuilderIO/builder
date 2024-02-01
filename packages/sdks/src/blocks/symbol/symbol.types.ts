import type { BuilderContent } from '../../types/builder-content.js';
import type {
  BuilderComponentsProp,
  BuilderLinkComponentProp,
} from '../../types/builder-props.js';

interface SymbolInfo {
  model?: string;
  entry?: string;
  data?: any;
  content?: BuilderContent;
  inline?: boolean;
  dynamic?: boolean;
}

export interface SymbolProps
  extends BuilderComponentsProp,
    BuilderLinkComponentProp {
  symbol?: SymbolInfo;
  dataOnly?: boolean;
  dynamic?: boolean;
  attributes?: any;
  inheritState?: boolean;
}
