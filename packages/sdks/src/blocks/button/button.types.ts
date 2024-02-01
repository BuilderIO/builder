import type { BuilderLinkComponentProp } from '../../types/builder-props.js';

export interface ButtonProps extends BuilderLinkComponentProp {
  attributes?: any;
  text?: string;
  link?: string;
  openLinkInNewTab?: boolean;
}
