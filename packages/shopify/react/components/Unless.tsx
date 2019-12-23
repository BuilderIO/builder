import * as React from 'react';
import builder, {
  Builder,
  BuilderStore,
  onChange,
  withBuilder,
  BuilderElement,
  stringToFunction,
  BuilderBlocks,
} from '@builder.io/react';

interface UnlessBlockProps {
  builderState?: BuilderStore;
  builderBlock?: BuilderElement;
  unlessBlocks?: BuilderElement[];
  elseBlocks?: BuilderElement[];
  expression?: string;
}

export class UnlessBlock extends React.Component<UnlessBlockProps> {
  private getMatchingBlocks() {
    const { expression, unlessBlocks, elseBlocks } = this.props;
    if (!expression) {
      return unlessBlocks;
    }
    const fn = stringToFunction(expression);
    const result = fn(
      this.props.builderState && this.props.builderState.state,
      null,
      this.props.builderBlock,
      builder,
      null,
      this.props.builderState!.update,
      Builder,
      this.props.builderState?.context
    );
    return result ? elseBlocks : unlessBlocks;
  }

  render() {
    const { unlessBlocks } = this.props;
    const blocks = this.getMatchingBlocks();
    if (!blocks) {
      return null;
    }
    const isUnless = blocks === unlessBlocks;

    return (
      <BuilderBlocks
        child
        parentElementId={this.props.builderBlock && this.props.builderBlock.id}
        blocks={blocks}
        dataPath={`component.options.${isUnless ? 'unlessBlocks' : 'elseBlocks'}`}
      />
    );
  }
}

const defaultBlock = {
  '@type': '@builder.io/sdk:Element',
  responsiveStyles: {
    large: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      flexShrink: '0',
      position: 'relative',
      marginTop: '30px',
      textAlign: 'center',
      lineHeight: 'normal',
      height: 'auto',
    },
  },
  component: {
    name: 'Text',
    options: {
      text: '<p>Enter some text...</p>',
    },
  },
};

withBuilder(UnlessBlock, {
  name: 'Shopify:Unless',
  hideFromInsertMenu: true,
  noWrap: true,
  inputs: [
    {
      name: 'expression',
      type: 'javascript',
    },
    {
      name: 'unlessBlocks',
      type: 'array',
      hideFromUI: true,
      defaultValue: [defaultBlock],
    },
    {
      name: 'elseBlocks',
      type: 'array',
      hideFromUI: true,
      defaultValue: [defaultBlock],
    },
  ],
});
