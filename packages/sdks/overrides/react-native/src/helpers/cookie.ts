import type { CanTrack } from '../types/can-track.js';
import { logger } from './logger.js';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Storage from 'react-native-storage';
import { isBrowser } from '../functions/is-browser.js';

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

// stub, never called, but needed to fix bundling.
export const getCookieSync = (
  _: {
    name: string;
  } & CanTrack
): any => {};

export const getCookie = async ({
  name,
  canTrack,
}: {
  name: string;
} & CanTrack) => {
  try {
    if (!canTrack) {
      return undefined;
    }

    // react-native does not support underscores in names
    const parsedName = name.replace(/_/g, '.');

    const data = await storage.load({ key: getStorageName(parsedName) });

    return data.value;
  } catch (err) {
    if (err?.name !== 'NotFoundError') {
      logger.warn('[COOKIE] GET error: ', err?.message || err);
    }
    return undefined;
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
} & CanTrack) => {
  try {
    if (!canTrack) {
      return undefined;
    }
    // convert `expires` date to number representing milliseconds from now until the date
    const expiresAsNumber = expires
      ? expires.getTime() - Date.now()
      : undefined;

    await storage.save({
      key: getStorageName(name),
      data: { value },
      expires: expiresAsNumber,
    });
  } catch (err) {
    if (err?.name !== 'NotFoundError') {
      logger.warn('[COOKIE] SET error: ', err?.message || err);
    }
    return undefined;
  }
};
