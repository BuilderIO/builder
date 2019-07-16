import { Builder, Component } from '@builder.io/sdk';

interface AngularComponent extends Component {}

export function BuilderBlock(options: AngularComponent) {
  options.type = 'angular';

  return Builder.Component(options);
}
