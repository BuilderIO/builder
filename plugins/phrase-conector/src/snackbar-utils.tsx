/** @jsx jsx */
import { jsx } from '@emotion/core';
import appState from '@builder.io/app-context';
import { action } from 'mobx';
import React from 'react';
import { useObserver, useLocalStore } from 'mobx-react';
import {
  DialogActions,
  Select,
  MenuItem,
  ListItemText,
  Checkbox,
  Typography,
  Button,
  Radio,
} from '@material-ui/core';

export function showJobNotification(projectUid: string) {
  appState.snackBar.show(
    <div css={{ display: 'flex', alignItems: 'center' }}>Done!</div>,
    2000,
    <Button
      color="primary"
      css={{
        pointerEvents: 'auto',
        ...(appState.document.small && {
          width: 'calc(100vw - 90px)',
          marginRight: 45,
          marginTop: 10,
          marginBottom: 10,
        }),
      }}
      variant="contained"
      onClick={async () => {
        const link = `https://cloud.memsource.com/web/project2/show/${projectUid}`;
        window.open(link, '_blank');
        appState.snackBar.open = false;
      }}
    >
      Go to job details
    </Button>
  );
}

export function showOutdatedNotifications(callback: () => void) {
  appState.snackBar.show(
    <div css={{ display: 'flex', alignItems: 'center' }}>Contant has new strings!</div>,
    6000,
    <Button
      color="primary"
      css={{
        pointerEvents: 'auto',
        ...(appState.document.small && {
          width: 'calc(100vw - 90px)',
          marginRight: 45,
          marginTop: 10,
          marginBottom: 10,
        }),
      }}
      variant="contained"
      onClick={async () => {
        callback();
        appState.snackBar.open = false;
      }}
    >
      Request an updated translation
    </Button>
  );
}

interface Props {
  onChoose: (val: { sourceLang: string; targetLangs: string[] } | null) => void;
}
const lsKey = 'phrase.sourceLang';

const safeLsGet = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeLsSet = (key: string, value: string) => {
  try {
    return localStorage.setItem(key, value);
  } catch {
    return null;
  }
};

const PhraseConfigurationEditor: React.FC<Props> = props => {
  const store = useLocalStore(() => ({
    targetLangs: [] as string[],
    get availableLangs(): string[] {
      return (
        appState.user.organization.value.customTargetingAttributes
          ?.get('locale')
          ?.toJSON()
          .enum?.filter((locale: string) => locale !== store.sourceLang) || []
      );
    },
    sourceLang:
      safeLsGet(lsKey) ||
      appState.user.organization.value.customTargetingAttributes?.get('locale')?.toJSON().enum[0],
  }));

  return useObserver(() => (
    <div css={{ margin: 20 }}>
      <div>
        <Typography>Source Language*</Typography>
        <Select
          fullWidth
          value={store.sourceLang}
          renderValue={() => store.sourceLang}
          onChange={action(event => {
            store.sourceLang = event.target.value;
            store.targetLangs = store.targetLangs.filter(locale => locale !== store.sourceLang);
            safeLsSet(lsKey, store.sourceLang);
          })}
        >
          {[store.sourceLang].concat(store.availableLangs).map(locale => (
            <MenuItem key={locale} value={locale}>
              <Radio color="primary" checked={store.sourceLang === locale} />

              <ListItemText primary={locale} />
            </MenuItem>
          ))}
        </Select>

        <Typography css={{ marginBottom: 15, marginTop: 10 }} variant="caption">
          Pick from the list of available languages
        </Typography>
      </div>
      <div>
        <Typography>Target Languages*</Typography>
        <Select
          multiple
          fullWidth
          value={store.targetLangs}
          placeholder="+ Add a value"
          renderValue={selected => (Array.isArray(selected) ? selected?.join(',') : selected)}
          onChange={action(event => {
            store.targetLangs = [...event.target.value];
          })}
        >
          {store.sourceLang ? (
            store.availableLangs.map(locale => (
              <MenuItem key={locale} value={locale}>
                <Checkbox color="primary" checked={store.targetLangs.includes(locale)} />

                <ListItemText primary={locale} />
              </MenuItem>
            ))
          ) : (
            <Typography>Pick a source language first</Typography>
          )}
        </Select>

        <Typography css={{ marginBottom: 15, marginTop: 10 }} variant="caption">
          Pick from the list of available languages
        </Typography>
      </div>
      <DialogActions>
        <Button onClick={() => props.onChoose(null)} color="default">
          cancel
        </Button>
        <Button variant="contained" onClick={() => props.onChoose(store)} color="primary">
          Translate
        </Button>
      </DialogActions>
    </div>
  ));
};

export async function getLangPicks(): Promise<{
  sourceLang: string;
  targetLangs: string[];
} | null> {
  return new Promise(async resolve => {
    const destroy = await appState.globalState.openDialog(
      React.createElement(PhraseConfigurationEditor, {
        onChoose: val => {
          resolve(val);
          destroy();
        },
      }),
      true,
      {},
      () => resolve(null)
    );
  });
}
