import { isBrowser } from "../functions/is-browser.js";

const getLocalStorage = () => isBrowser() && typeof localStorage !== "undefined" ? localStorage : void 0;

const getLocalStorageItem = ({
  key,
  canTrack
}) => {
  var _a;

  try {
    if (canTrack) {
      return (_a = getLocalStorage()) == null ? void 0 : _a.getItem(key);
    }

    return void 0;
  } catch (err) {
    console.debug("[LocalStorage] GET error: ", err);
    return void 0;
  }
};

const setLocalStorageItem = ({
  key,
  canTrack,
  value
}) => {
  var _a;

  try {
    if (canTrack) {
      (_a = getLocalStorage()) == null ? void 0 : _a.setItem(key, value);
    }
  } catch (err) {
    console.debug("[LocalStorage] SET error: ", err);
  }
};

export { getLocalStorageItem, setLocalStorageItem }