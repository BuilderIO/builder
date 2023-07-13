import { isBrowser } from '../functions/is-browser.js';
import type { CanTrack } from '../types/can-track.js';
import type { Nullable } from './nullable.js';

const getLocalStorage = () =>
  isBrowser() && typeof localStorage !== 'undefined' ? localStorage : undefined;

export const getLocalStorageItem = ({
  key,
  canTrack,
}: {
  key: string;
} & CanTrack): Nullable<string> => {
  try {
    if (canTrack) {
      return getLocalStorage()?.getItem(key);
    }
    return undefined;
  } catch (err) {
    console.debug('[LocalStorage] GET error: ', err);
    return undefined;
  }
};

export const setLocalStorageItem = ({
  key,
  canTrack,
  value,
}: {
  key: string;
  value: string;
} & CanTrack) => {
  try {
    if (canTrack) {
      getLocalStorage()?.setItem(key, value);
    }
  } catch (err) {
    console.debug('[LocalStorage] SET error: ', err);
  }
};
