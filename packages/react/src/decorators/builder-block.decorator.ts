import { Builder, Class, Component } from '@builder.io/sdk';
import React from 'react';

interface ReactComponent extends Component {}

export function BuilderBlock<P extends object>(options: ReactComponent) {
  options.type = 'react';

  return Builder.Component(options) as (component: React.ComponentType<P>) => Class;
}
