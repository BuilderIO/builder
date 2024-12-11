import { Component } from '@builder.io/sdk';
import { BuilderBlock } from '../decorators/builder-block.decorator';

type DeriveReactComponentOrClass<A, B, C> =
  Component extends React.Component<A, B, C>
    ? React.Component<A, B, C>
    : Component extends React.ComponentClass<A, B>
      ? React.ComponentClass<A, B>
      : never;

export function withBuilder<A, B, C, T = DeriveReactComponentOrClass<A, B, C>>(
  component: T,
  options: Component
): T {
  BuilderBlock(options)(component as any);
  return component;
}
