import React from 'react';
import {
  withBuilder,
  BuilderStore,
  BuilderElement,
  BuilderBlockComponent,
} from '@builder.io/react';

interface ConditionalTag extends Omit<BuilderElement, 'children'> {
  renderIf?: 'true' | '';
}

interface WrapperTagProps {
  builderBlock: BuilderElement;
  conditionalTags: ConditionalTag[];
  builderState: BuilderStore;
}

function fastClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

const WrapperTagComponent: React.FC<WrapperTagProps> = ({
  conditionalTags,
  builderBlock,
  builderState,
}) => {
  if (builderState.context?.shopify) {
    const liquid = builderState.context.shopify.liquid;
    const validTags = conditionalTags.filter(
      tag => liquid.render(tag.meta?.renderIf, builderState.state) === 'true'
    );
    const tags = fastClone(validTags) as BuilderElement[];

    if (tags.length === 0) {
      return <BuilderBlockComponent block={builderBlock} />;
    }

    const head = tags[0];
    let node = head;
    let i = 0;
    while (node) {
      i++;
      if (tags[i]) {
        node.children = [tags[i]];
      }
      node.tagName = node.component?.options.tag;
      // opencondtag, perhaps remove it after second traverse on import
      delete node.component;
      node = tags[i];
    }
    tags[tags.length - 1].children = builderBlock.children;

    return <BuilderBlockComponent block={head} />;
  }
  return <></>;
};

export const WrapperTag = withBuilder(WrapperTagComponent, {
  name: 'Shopify:WrapperTag',
  canHaveChildren: true,
  noWrap: true,
  hideFromInsertMenu: true,
});
