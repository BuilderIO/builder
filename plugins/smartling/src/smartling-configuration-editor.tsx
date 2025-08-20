/** @jsx jsx */
import { jsx } from '@emotion/core';
import { CustomReactEditorProps, fastClone } from './plugin-helpers';
import { observable, reaction, IReactionOptions, action } from 'mobx';
import React, { useEffect } from 'react';
import { useObserver, useLocalStore } from 'mobx-react';
import { Project, SmartlingApi } from './smartling';
import appState from '@builder.io/app-context';
import pkg from '../package.json';
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
  console.log('Smartling: SmartlingConfigurationEditor component mounted');
  
  const store = useLocalStore(() => {
    // Get default project from plugin settings
    const pluginSettings = appState.user.organization?.value?.settings?.plugins?.get(pkg.name);
    const defaultProjectId = pluginSettings?.get('defaultProjectId') || '';
    
    console.log('Smartling: SmartlingConfigurationEditor initializing with:', {
      defaultProjectId,
      propsValue: props.value
    });
    
    // Initialize with default project if no value is provided
    const initialValue = props.value ? fastClone(props.value) : { project: defaultProjectId };
    
    console.log('Smartling: SmartlingConfigurationEditor initialValue:', initialValue);
    
    return {
    loading: false,
    projects: [] as any[],
    project: null as Project | null,
    filters: observable.map(initialValue),
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
    };
  });

  useEffect(() => {
    store.targetLocales = props.value?.get('targetLocales') || [];
    
    // Debug: Check default project configuration
    const pluginSettings = appState.user.organization?.value?.settings?.plugins?.get(pkg.name);
    const defaultProjectId = pluginSettings?.get('defaultProjectId') || '';
    const currentProject = props.value?.get('project') || '';
    
    console.log('Smartling: SmartlingConfigurationEditor debug:', {
      defaultProjectId,
      currentProject,
      hasPropsValue: !!props.value,
      propsValue: props.value?.toJS ? props.value.toJS() : props.value
    });
    
    // If we have a default project but no current project selected, auto-select it
    if (defaultProjectId && !currentProject) {
      console.log(`Smartling: Auto-selecting default project: ${defaultProjectId}`);
      // Set the default project in the filters and trigger onChange
      store.filters.set('project', defaultProjectId);
      store.setValue();
    }
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
              multiple
              placeholder="+ Add a value"
              renderValue={selected => (Array.isArray(selected) ? selected?.join(',') : selected)}
              onChange={() => {
                // Handle selection through individual MenuItem onClick events
              }}
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
                    <MenuItem 
                      key={locale.localeId} 
                      value={locale.localeId}
                      onClick={action(event => {
                        event.preventDefault();
                        if (store.targetLocales.includes(locale.localeId)) {
                          // remove
                          store.targetLocales = store.targetLocales.filter(
                            targetLocale => targetLocale !== locale.localeId
                          );
                        } else {
                          // add
                          store.targetLocales = [locale.localeId, ...store.targetLocales];
                        }
                        store.setValue();
                      })}
                    >
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
