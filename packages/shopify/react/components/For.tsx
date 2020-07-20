import {
  BuilderStore,
  withBuilder,
  BuilderStoreContext,
  BuilderBlockComponent,
  BuilderElement,
  Builder,
} from '@builder.io/react';
import React, { useState } from 'react';

interface ForBlockProps {
  repeat: {
    itemName: string;
    collection: string;
  };
  builderState?: BuilderStore;
  builderBlock?: BuilderElement;
}

export function ForBlock(props: ForBlockProps) {
  let arrayItems: any[] = [];
  const { repeat, builderState } = props;

  const collectionPath = repeat.collection;
  const collectionName = (collectionPath || '').trim().split('(')[0].trim().split('.').slice(-1)[0];

  const itemName = repeat.itemName || (collectionName ? collectionName + 'Item' : 'item');

  if (itemName && collectionName && builderState && Builder.isBrowser) {
    if (builderState.context.shopify) {
      const renderedItems = builderState.context.shopify.liquid.get(
        collectionPath,
        builderState.state
      );

      if (Array.isArray(renderedItems)) {
        arrayItems = renderedItems;
      }
    }
  }

  return arrayItems?.map((item, index) => {
    const scopedState: any = {
      forloop: {
        index0: index,
        index: index + 1,
        first: index === 0,
        last: index === arrayItems.length - 1,
        length: arrayItems.length,
        rindex: arrayItems.length - index,
        rindex0: arrayItems.length - index - 1,
      },
    };

    // add the itemName (ie "product") to the state so the children can access
    scopedState[itemName] = item;

    return (
      <BuilderStoreContext.Consumer key={index}>
        {store => (
          <BuilderStoreContext.Provider
            value={{
              ...store,
              state: {
                ...store.state,
                ...scopedState,
              },
            }}
          >
            {props.builderBlock?.children?.map(item => (
              <BuilderBlockComponent block={item} key={item.id} />
            ))}
          </BuilderStoreContext.Provider>
        )}
      </BuilderStoreContext.Consumer>
    );
  });
}

withBuilder(ForBlock, {
  name: 'Shopify:For',
  hideFromInsertMenu: true,
  noWrap: true,
  inputs: [
    {
      name: 'expression',
      type: 'javascript',
    },
  ],
});
