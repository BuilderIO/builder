import { Builder, Component, Class } from '@builder.io/sdk';

export interface AngularComponent extends Component {
  tag: string;
}

export function BuilderBlock(options: AngularComponent) {
  options.type = 'angular';

  return Builder.Component(options);
}
