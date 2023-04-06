import { isBrowser } from './is-browser.js';

const settings: Settings = {};

export type Settings = { customInsertMenu?: boolean };

export function setEditorSettings(newSettings: Settings) {
  if (isBrowser()) {
    Object.assign(settings, newSettings);
    const message = {
      type: 'builder.settingsChange',
      data: settings,
    };
    parent.postMessage(message, '*');
  }
}
