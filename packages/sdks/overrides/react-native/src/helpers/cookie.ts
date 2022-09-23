import type { CanTrack } from '../types/can-track.js';
import type { OrgId } from './document-cookie';

import Storage from 'react-native-storage';
import { isBrowser } from '../functions/is-browser.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONE_DAY = 1000 * 60 * 60 * 24;

const initStorage = () => {
  const backend = isBrowser() ? window.localStorage : AsyncStorage;
  const storage = new Storage({
    // maximum capacity, default 1000 key-ids
    size: 1000,

    // Use AsyncStorage for RN apps, or window.localStorage for web apps.
    // If storageBackend is not set, data will be lost after reload.
    storageBackend: backend,

    // expire time, default: 1 day (1000 * 3600 * 24 milliseconds).
    // can be null, which means never expire.
    defaultExpires: ONE_DAY * 30,

    // cache data in the memory. default is true.
    enableCache: true,
  });

  return storage;
};

const storage = initStorage();

const getStorageName = (name: string) => `builderio.${name}`;

export const getCookie = async ({
  name,
  canTrack,
}: {
  name: string;
} & CanTrack &
  OrgId) => {
  try {
    if (!canTrack) {
      return undefined;
    }

    // react-native does not support underscores in names
    const parsedName = name.replace(/_/g, '.');

    const data = await storage.load({ key: getStorageName(parsedName) });

    return data.value;
  } catch (err) {
    console.debug('[COOKIE] GET error: ', err);
  }
};

export const setCookie = async ({
  name,
  value,
  expires,
  canTrack,
}: {
  name: string;
  value: string;
  expires?: Date;
} & CanTrack &
  OrgId) => {
  try {
    if (!canTrack) {
      return undefined;
    }
    await storage.save({ key: getStorageName(name), data: { value }, expires });
  } catch (err) {
    console.warn('[COOKIE] SET error: ', err);
  }
};
