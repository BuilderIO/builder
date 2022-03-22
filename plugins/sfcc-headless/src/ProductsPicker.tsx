/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import { CheckBoxOutlineBlank, CheckBox, FilterList } from '@material-ui/icons';
import { runInAction, action } from 'mobx';
import { useObserver, useLocalStore } from 'mobx-react';
import React, { useEffect } from 'react';
import {
  ResourcePreviewCell,
  ResourcePickerProps,
  Resource,
} from '@builder.io/commerce-plugin-tools';
import InfiniteScroll from 'react-infinite-scroll-component';
import throttle from 'lodash.throttle';
import safeLocalStorage from 'safe-localstorage';
import { observable, reaction, IReactionOptions } from 'mobx';

function useReaction<T = any>(
  expression: () => T,
  effect: (value: T) => void,
  options: IReactionOptions = { fireImmediately: true }
): void {
  useEffect(() => reaction(expression, effect, options), []);
}

const PAGE = 30;
const LS_KEY = 'sfcc-headless.lastChoice';
export const ProductsPicker: React.FC<
  ResourcePickerProps & {
    value?: any;
    pickProducts?: boolean;
    renderEditor?: (options: any) => any;
  }
> = props => {
  const store = useLocalStore(() => ({
    loading: false,
    products: [] as Resource[],
    filters: null as any,
    searchQuery: observable.map({
      keyword: '',
      rootCategory: '',
      id: '',
    }),
    get rootCategory() {
      return store.searchQuery.get('rootCategory') || 'all';
    },
    get keyword() {
      return store.searchQuery.get('keyword');
    },
    catchError: (err: any) => {
      console.error('search error:', err);
      props.context.snackBar.show('There was an error searching for products');
    },

    fetchMore: throttle(
      async () => {
        const moreProducts = await props.api.product
          .search(`${store.rootCategory}:${store.keyword || ''}`, store.products.length, PAGE)
          .catch(store.catchError);
        runInAction(() => {
          if (Array.isArray(moreProducts)) {
            const products = moreProducts.filter(
              resource => !(props.omitIds || []).includes(String(resource.id))
            );
            store.products = store.products.concat(products);
          }
        });
      },
      100,
      {
        leading: true,
      }
    ),
    search: throttle(
      async () => {
        store.loading = true;
        const id = store.searchQuery.get('id');
        const productsResponse = id
          ? await props.api.product.findById(id).catch(store.catchError)
          : await props.api.product
              .search(`${store.rootCategory}:${store.keyword || ''}`)
              .catch(store.catchError);

        runInAction(() => {
          if (Array.isArray(productsResponse)) {
            store.products = productsResponse.filter(
              resource => resource && !(props.omitIds || []).includes(String(resource.id))
            );
          } else if (productsResponse) {
            store.products = [productsResponse];
          }
          store.loading = false;
        });
      },
      500,
      { leading: true }
    ),
  }));
  useEffect(() => {
    if (safeLocalStorage.get(LS_KEY)) {
      store.searchQuery.set('rootCategory', safeLocalStorage.get(LS_KEY));
    } else {
      const val = props.value?.c_categories?.at(-1);
      if (val) {
        store.searchQuery.set('rootCategory', val.includes('~') ? val.split('~').join('|') : val);
      } else {
        store.searchQuery.set('rootCategory', 'all');
      }
    }
    store.filters = observable.map({
      rootCategory: {
        options: observable.map({ category: store.searchQuery.get('rootCategory') }),
      },
    });
  }, [props.value]);

  useReaction(
    () =>
      `${store.searchQuery.get('rootCategory')}${store.searchQuery.get(
        'keyword'
      )}${store.searchQuery.get('id')}`,
    () => {
      store.search();
      safeLocalStorage.set(LS_KEY, store.rootCategory);
    }
  );

  return useObserver(() => (
    <div css={{ display: 'flex', flexDirection: 'column', minWidth: 500 }}>
      <div css={{ margin: '40px 20px 5px' }}>
        <ExpansionPanel>
          <ExpansionPanelSummary expandIcon={<FilterList />}>Filters</ExpansionPanelSummary>
          <ExpansionPanelDetails css={{ flexDirection: 'column' }}>
            {Boolean(store.filters) &&
              props.renderEditor?.({
                fields: [
                  {
                    name: 'rootCategory',
                    friendlyName: 'Search by category',
                    type: 'SalesforceCategory',
                  },
                  {
                    name: 'keyword',
                    friendlyName: 'Search by keyword',
                    type: 'text',
                  },
                  {
                    name: 'id',
                    friendlyName: 'Search by product ID',
                    type: 'search',
                  },
                ],
                object: store.filters,
                onChange: (map: any) => {
                  const options = fastClone(map);
                  const query = {
                    rootCategory:
                      options.rootCategory?.options?.category ||
                      store.searchQuery.get('rootCategory'),
                    keyword: options.keyword,
                    id: options.id || '',
                  };
                  store.searchQuery.replace(query);
                },
              })}
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
      <div id="products-container" css={{ maxHeight: '80vh', overflow: 'auto', padding: 5 }}>
        <InfiniteScroll
          scrollableTarget="products-container"
          dataLength={store.products.length}
          next={store.fetchMore}
          hasMore={
            !store.searchQuery.get('id') &&
            store.products.length > 0 &&
            store.products.length % PAGE === 0
          }
          loader="fetching ..."
        >
          {!store.loading &&
            (store.products.length ? (
              store.products.map(item => (
                <div css={{ display: 'flex' }} key={item.id}>
                  <Tooltip title={item.id}>
                    <React.Fragment>
                      <IconButton
                        onClick={action(() => {
                          props.onChange(item);
                        })}
                      >
                        {String(item.id) === String(props.value?.id) ? (
                          <CheckBox />
                        ) : (
                          <CheckBoxOutlineBlank />
                        )}
                      </IconButton>

                      <ResourcePreviewCell
                        selected={props.value?.id === item.id}
                        resource={item}
                        key={item.id}
                      />
                    </React.Fragment>
                  </Tooltip>
                </div>
              ))
            ) : (
              <div>
                <Typography
                  css={{
                    margin: '40px 20px',
                    textAlign: 'center',
                    fontSize: 17,
                  }}
                  variant="caption"
                >
                  No products found
                </Typography>
              </div>
            ))}
        </InfiniteScroll>

        {store.loading && <CircularProgress disableShrink css={{ margin: '50px auto' }} />}
      </div>
    </div>
  ));
};

const fastClone = (obj: any) => JSON.parse(JSON.stringify(obj));
