/** @jsx jsx */
import { jsx } from '@emotion/core';
import { CustomReactEditorProps, fastClone } from './plugin-helpers';
import { observable, reaction, IReactionOptions, action } from 'mobx';
import React, { useEffect } from 'react';
import { useObserver, useLocalStore } from 'mobx-react';
import { Project, SmartlingApi } from './smartling';
import {
  CircularProgress,
  Select,
  MenuItem,
  ListItemText,
  Checkbox,
  Typography,
} from '@material-ui/core';

function useReaction<T = any>(
  expression: () => T,
  effect: (value: T) => void,
  options: IReactionOptions<any, any> = { fireImmediately: true }
): void {
  useEffect(() => reaction(expression, effect, options), []);
}

interface Props extends CustomReactEditorProps {
  api: SmartlingApi;
}

export const SmartlingConfigurationEditor: React.FC<Props> = props => {
  const store = useLocalStore(() => ({
    loading: false,
    projects: [] as any[],
    project: null as Project | null,
    filters: observable.map(props.value ? fastClone(props.value) : { project: '' }),
    targetLocales: [] as string[],
    catchError: (err: any) => {
      console.error('search error:', err);
      props.context.snackBar.show('There was an error searching for products');
      return null;
    },
    async fetchProject(projectId: string) {
      store.loading = true;
      this.project =
        (await props.api.getProject(projectId).catch(e => this.catchError(e)))?.project || null;
      // remove all target locales that are not in this project
      store.targetLocales = store.targetLocales.filter(locale =>
        this.project?.targetLocales.find(localeObj => localeObj.localeId === locale)
      );
      store.setValue();
      store.loading = false;
    },
    setValue() {
      props.onChange({
        ...fastClone(store.filters),
        targetLocales: store.targetLocales,
      });
    },
  }));

  useEffect(() => {
    store.targetLocales = props.value?.get('targetLocales') || [];
  }, [props.value]);

  useReaction(
    () => store.filters.get('project'),
    projectId => {
      if (projectId) {
        store.fetchProject(projectId);
      } else {
        store.project = null;
      }
    }
  );

  return useObserver(() => (
    <React.Fragment>
      <div css={{ marginBottom: 25, marginTop: 20 }}>
        <div
          css={{
            paddingLeft: 15,
            marginTop: 10,
            paddingBottom: 10,
            borderLeft: '1px solid #ccc',
          }}
        >
          {props.renderEditor({
            object: store.filters,
            fields: [
              {
                name: 'project',
                type: 'SmartlingProject',
                helperText: 'Project choice determines source locale',
                required: true,
              },
            ],
          })}
        </div>
      </div>
      <div css={{ marginBottom: 25, marginTop: 20 }}>
        <div
          css={{
            paddingLeft: 15,
            marginTop: 10,
            paddingBottom: 10,
            borderLeft: '1px solid #ccc',
          }}
        >
          <Typography>Target Locales*</Typography>
          {store.loading ? (
            <div css={{ textAlign: 'center' }}>
              <CircularProgress disableShrink size={20} />{' '}
            </div>
          ) : (
            <Select
              fullWidth
              value={store.targetLocales}
              placeholder="+ Add a value"
              renderValue={selected => (Array.isArray(selected) ? selected?.join(',') : selected)}
              onChange={action(event => {
                if (store.targetLocales.includes(event.target.value)) {
                  // remove
                  store.targetLocales = store.targetLocales.filter(
                    locale => locale !== event.target.value
                  );
                } else {
                  store.targetLocales = [event.target.value, ...store.targetLocales];
                }
                store.setValue();
              })}
            >
              {store.project ? (
                <>
                  <MenuItem
                    key="select-all"
                    value=""
                    onClick={action(event => {
                      event.preventDefault();
                      const allLocaleIds = store.project?.targetLocales.map(locale => locale.localeId) || [];
                      const allSelected = allLocaleIds.every(localeId => store.targetLocales.includes(localeId));
                      
                      if (allSelected) {
                        // Deselect all
                        store.targetLocales = [];
                      } else {
                        // Select all
                        store.targetLocales = [...allLocaleIds];
                      }
                      store.setValue();
                    })}
                  >
                    <Checkbox
                      color="primary"
                      checked={store.project?.targetLocales.every(locale => store.targetLocales.includes(locale.localeId)) || false}
                      indeterminate={
                        store.targetLocales.length > 0 && 
                        !store.project?.targetLocales.every(locale => store.targetLocales.includes(locale.localeId))
                      }
                    />
                    <ListItemText primary="Select All" />
                  </MenuItem>
                  {store.project.targetLocales.map(locale => (
                    <MenuItem key={locale.localeId} value={locale.localeId}>
                      <Checkbox
                        color="primary"
                        checked={store.targetLocales.includes(locale.localeId)}
                      />

                      <ListItemText primary={locale.description} />
                    </MenuItem>
                  ))}
                </>
              ) : (
                <Typography>Pick a project first</Typography>
              )}
            </Select>
          )}
          <Typography css={{ marginBottom: 15, marginTop: 10 }} variant="caption">
            Pick from the list of available target locales
          </Typography>
        </div>
      </div>
    </React.Fragment>
  ));
};
