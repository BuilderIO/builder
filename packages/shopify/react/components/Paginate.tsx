import {
  BuilderStore,
  withBuilder,
  BuilderStoreContext,
  BuilderBlockComponent,
  BuilderElement,
} from '@builder.io/react';
import * as React from 'react';

interface AssignBlockProps {
  expression?: string;
  limit?: string;
  builderState?: BuilderStore;
  builderBlock?: BuilderElement;
}

export function PaginateBlock(props: AssignBlockProps) {
  const defaultPaginationLimit = 15;
  const { expression, builderState, limit } = props;
  let paginate: any = {};

  if (
    expression &&
    builderState?.context?.shopify &&
    builderState.state.collection?.products?.length
  ) {
    const totalProducts = builderState.state.collection.products_count;
    const itemLimit =
      builderState.context.shopify.liquid.get(limit, builderState.state) || defaultPaginationLimit;

    let currentPage = 1;
    if (builderState.state.location.query.page) {
      // this is undefined, should probably add support to query params on location
      currentPage = parseInt(builderState.state.location.query.page, 10) || currentPage;
    } else if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      currentPage = parseInt(urlParams.get('page') || '1', 10);
    }

    paginate = {
      current_page: currentPage,
      current_offset: currentPage * itemLimit,
      items: builderState.state.collection.products.length,
      parts: [],
      next: {},
      previous: {},
      page_size: itemLimit,
      pages: Math.ceil(totalProducts / itemLimit),
      expression: builderState.context.shopify.liquid.render(expression, builderState.state),
    };

    if (currentPage < paginate.pages) {
      paginate.next.url = `?page=${currentPage + 1}`;
    }

    if (currentPage > 1) {
      paginate.previous.url = `?page=${currentPage - 1}`;
    }
  }

  return (
    <BuilderStoreContext.Consumer>
      {store => (
        <BuilderStoreContext.Provider
          value={{
            ...store,
            state: {
              ...store.state,
              paginate,
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
}

withBuilder(PaginateBlock, {
  name: 'Shopify:Paginate',
  hideFromInsertMenu: true,
  noWrap: true,
  inputs: [
    {
      name: 'expression',
      type: 'javascript',
    },
  ],
});
