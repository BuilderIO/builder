var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { logger } from "./logger.js";
import Storage from "react-native-storage";
import { isBrowser } from "../functions/is-browser.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
const ONE_DAY = 1e3 * 60 * 60 * 24;
const initStorage = () => {
  const backend = isBrowser() ? window.localStorage : AsyncStorage;
  const storage2 = new Storage({
    size: 1e3,
    storageBackend: backend,
    defaultExpires: ONE_DAY * 30,
    enableCache: true
  });
  return storage2;
};
const storage = initStorage();
const getStorageName = (name) => `builderio.${name}`;
const getCookie = (_0) => __async(void 0, [_0], function* ({
  name,
  canTrack
}) {
  try {
    if (!canTrack) {
      return void 0;
    }
    const parsedName = name.replace(/_/g, ".");
    const data = yield storage.load({ key: getStorageName(parsedName) });
    return data.value;
  } catch (err) {
    if ((err == null ? void 0 : err.name) !== "NotFoundError") {
      logger.warn("[COOKIE] GET error: ", (err == null ? void 0 : err.message) || err);
    }
    return void 0;
  }
});
const setCookie = (_0) => __async(void 0, [_0], function* ({
  name,
  value,
  expires,
  canTrack
}) {
  try {
    if (!canTrack) {
      return void 0;
    }
    yield storage.save({ key: getStorageName(name), data: { value }, expires });
  } catch (err) {
    if ((err == null ? void 0 : err.name) !== "NotFoundError") {
      logger.warn("[COOKIE] SET error: ", (err == null ? void 0 : err.message) || err);
    }
    return void 0;
  }
});
export {
  getCookie,
  setCookie
};
