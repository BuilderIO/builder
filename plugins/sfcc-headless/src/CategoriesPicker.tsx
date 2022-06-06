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
import debounce from 'lodash.debounce';

export const CategoriesPicker: React.FC<
  ResourcePickerProps & { value?: any; rootCategory?: string }
> = props => {
  const store = useLocalStore(() => ({
    formValue: '',
    rootCategory: props.rootCategory || 'all',
    loading: false,
    categories: [] as Resource[],
    expanded: {} as Record<string, boolean>,
    catchError: (err: any) => {
      console.error('search error:', err);
      props.context.snackBar.show('Oh no! There was an error searching for categories');
    },
    async search() {
      this.loading = true;

      const categoriesResponse = await props.api.category
        .search(store.rootCategory)
        .catch(store.catchError);

      runInAction(() => {
        if (Array.isArray(categoriesResponse)) {
          this.categories = categoriesResponse.filter(
            resource => !(props.omitIds || []).includes(String(resource.id))
          );
          if (this.categories.length === 1) {
            this.expanded[this.categories[0].id] = true;
          }
        }
        this.loading = false;
      });
    },
    goUp: debounce(async (candidate: string) => {
      const rootCategory: any = await props.api.category
        .findById(candidate)
        .catch(store.catchError);

      if ([store.formValue, store.rootCategory].includes(candidate)) {
        store.rootCategory = rootCategory?.parent_category_id || 'all';
        store.expanded = { [rootCategory.id]: true };
      }
    }, 100),
  }));

  useEffect(() => {
    if (!props.rootCategory) {
      store.rootCategory = props.value?.parent_category_id || 'all';
    }
  }, [props.value]);

  useEffect(() => {
    store.search();
  }, [store.rootCategory]);

  return useObserver(() => (
    <div css={{ display: 'flex', flexDirection: 'column', minWidth: 500 }}>
      {!props.rootCategory && (
        <div css={{ display: 'flex' }}>
          {store.rootCategory !== 'all' && (
            <IconButton
              onClick={() => {
                store.goUp(store.rootCategory);
              }}
              css={{ color: '#999', marginRight: -2, fontSize: 20 }}
            >
              <ChevronLeft />
            </IconButton>
          )}

          <TextField
            css={{ flexGrow: 1, marginTop: 10, marginRight: 15, padding: 8 }}
            value={store.formValue || store.rootCategory}
            onChange={e => {
              store.formValue = e.target?.value;
              store.goUp(store.formValue);
            }}
            placeholder={props.title}
          />
        </div>
      )}
      {store.loading && <CircularProgress disableShrink css={{ margin: '50px auto' }} />}
      <div css={{ maxHeight: '80vh', overflow: 'auto' }}>
        {!store.loading &&
          (store.categories.length ? (
            store.categories.map(item => (
              <ExpansionPanel
                expanded={store.expanded[item.id]}
                key={item.id}
                onChange={(_, isExpanded) => {
                  store.expanded[item.id] = isExpanded;
                }}
              >
                <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                  {
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
                  }

                  <ResourcePreviewCell
                    selected={store.formValue === item.id}
                    resource={item}
                    key={item.id}
                  />
                </ExpansionPanelSummary>

                <ExpansionPanelDetails css={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  {store.expanded[item.id] && (
                    <CategoriesPicker {...props} rootCategory={String(item.id)} />
                  )}
                </ExpansionPanelDetails>
              </ExpansionPanel>
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
                No categories found
              </Typography>
            </div>
          ))}
      </div>
    </div>
  ));
};
