import React from 'react';
import { Component } from '@builder.io/sdk';
import { BuilderBlock } from '../decorators/builder-block.decorator';

export function withBuilder<P extends object>(component: React.ComponentType<P>, options: Component) {
  BuilderBlock<P>(options)(component);
  return component;
}
