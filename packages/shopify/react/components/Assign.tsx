import React from 'react';
import { Builder, BuilderStore } from '@builder.io/react';

interface AssignBlockProps {
  expression?: string;
  builderState?: BuilderStore;
}

export class AssignBlock extends React.Component<AssignBlockProps> {
  ran = false;
  constructor(props: AssignBlockProps) {
    super(props);

    if (!this.run()) {
      // TODO: queueNextTick
      // TODO: fix the state updates
      setTimeout(() => this.run())
    }
  }

  run() {
    if (this.ran) {
      return true;
    }
    const { expression, builderState } = this.props;

    if (expression && builderState) {
      if (builderState.state.shopify) {
        builderState.state.shopify.liquid.assign(expression);
        this.ran = true;
        console.log('ran')
        return true;
      }
    }
    console.log('not ran')
    return false;
  }

  render() {
    return null;
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
