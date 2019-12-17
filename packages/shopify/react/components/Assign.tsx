import React from 'react';
import { Builder, BuilderStore } from '@builder.io/react';

interface AssignBlockProps {
  expression?: string;
  builderState?: BuilderStore;
}

export class AssignBlock extends React.Component<AssignBlockProps> {
  constructor(props: AssignBlockProps) {
    super(props);

    const { expression, builderState } = props;

    if (expression && builderState) {
      builderState.state.shopify?.liquid?.assign(expression);
    }
  }
}

Builder.registerComponent(AssignBlock, {
  name: 'Shopify:Assign',
  hideFromInsertMenu: true,
  inputs: [
    {
      name: 'expression',
      type: 'javascript',
      // TODO: type: 'code', language: 'javascript'
    },
  ],
});
