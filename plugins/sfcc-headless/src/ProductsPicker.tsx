/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Button,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import { Add, ExpandMore, ChevronLeft, CheckBoxOutlineBlank, CheckBox } from '@material-ui/icons';
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

const PAGE = 60;
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
    rootCategory: '',
    products: [] as Resource[],
    catchError: (err: any) => {
      console.error('search error:', err);
      props.context.snackBar.show('Oh no! There was an error searching for products');
    },

    fetchMore: throttle(
      async () => {
        const moreProducts = await props.api.product
          .search(store.rootCategory, store.products.length, PAGE)
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
    async search() {
      this.loading = true;
      const productsResponse = await props.api.product
        .search(store.rootCategory || 'all')
        .catch(store.catchError);

      runInAction(() => {
        if (Array.isArray(productsResponse)) {
          this.products = productsResponse.filter(
            resource => !(props.omitIds || []).includes(String(resource.id))
          );
        }
        this.loading = false;
      });
    },
  }));
  useEffect(() => {
    if (safeLocalStorage.get(LS_KEY)) {
      store.rootCategory = safeLocalStorage.get(LS_KEY);
    } else {
      const val = props.value?.c_categories?.at(-1);
      if (val) {
        store.rootCategory = val.includes('~') ? val.split('~').join('|') : val;
      } else {
        store.rootCategory = 'all';
      }
    }
  }, [props.value]);

  useEffect(() => {
    store.search();
    safeLocalStorage.set(LS_KEY, store.rootCategory);
  }, [store.rootCategory]);

  return useObserver(() => (
    <div css={{ display: 'flex', flexDirection: 'column', minWidth: 500 }}>
      <div css={{ padding: 5 }}>
        {Boolean(store.rootCategory) &&
          props.renderEditor?.({
            fields: [
              {
                name: 'category',
                friendlyName: 'Search by category',
                type: 'SalesforceCategory',
              },
            ],
            object: {
              get() {
                if (store.rootCategory !== 'all') {
                  return {
                    '@type': '@builder.io/core:Request',
                    options: {
                      get() {
                        return store.rootCategory;
                      },
                    },
                  };
                }
              },
              set(key: string, value: any) {
                if (value) {
                  runInAction(() => {
                    store.rootCategory = value.options?.category;
                    store.search();
                  });
                }
              },
            },
          })}
      </div>
      <div id="products-container" css={{ maxHeight: '80vh', overflow: 'auto' }}>
        <InfiniteScroll
          scrollableTarget="products-container"
          dataLength={store.products.length}
          next={store.fetchMore}
          hasMore={store.products.length % PAGE === 0}
          loader={<CircularProgress />}
        >
          {!store.loading &&
            (store.products.length ? (
              store.products.map(item => (
                <div css={{ display: 'flex' }} key={item.id}>
                  <Tooltip title={item.id}>
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
                  </Tooltip>

                  <ResourcePreviewCell
                    selected={props.value?.id === item.id}
                    resource={item}
                    key={item.id}
                  />
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
