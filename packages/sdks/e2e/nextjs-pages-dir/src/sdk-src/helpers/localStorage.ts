import { isBrowser } from '../functions/is-browser';
import type { CanTrack } from '../types/can-track';
import type { Nullable } from './nullable';
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
