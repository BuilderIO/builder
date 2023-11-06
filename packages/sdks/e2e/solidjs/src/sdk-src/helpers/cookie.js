var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = value => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };

    var rejected = value => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };

    var step = x => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);

    step((generator = generator.apply(__this, __arguments)).next());
  });
};

import { isBrowser } from "../functions/is-browser.js";
import { logger } from "./logger.js";
import { checkIsDefined } from "./nullable.js";
import { getTopLevelDomain } from "./url.js";

const getCookieSync = ({
  name,
  canTrack
}) => {
  var _a;

  try {
    if (!canTrack) {
      return void 0;
    }

    return (_a = document.cookie.split("; ").find(row => row.startsWith(`${name}=`))) == null ? void 0 : _a.split("=")[1];
  } catch (err) {
    logger.warn("[COOKIE] GET error: ", (err == null ? void 0 : err.message) || err);
    return void 0;
  }
};

const getCookie = args => __async(void 0, null, function* () {
  return getCookieSync(args);
});

const stringifyCookie = cookie => cookie.map(([key, value]) => value ? `${key}=${value}` : key).filter(checkIsDefined).join("; ");

const SECURE_CONFIG = [["secure", ""], ["SameSite", "None"]];

const createCookieString = ({
  name,
  value,
  expires
}) => {
  const secure = isBrowser() ? location.protocol === "https:" : true;
  const secureObj = secure ? SECURE_CONFIG : [[]];
  const expiresObj = expires ? [["expires", expires.toUTCString()]] : [[]];
  const cookieValue = [[name, value], ...expiresObj, ["path", "/"], ["domain", getTopLevelDomain(window.location.hostname)], ...secureObj];
  const cookie = stringifyCookie(cookieValue);
  return cookie;
};

const setCookie = _0 => __async(void 0, [_0], function* ({
  name,
  value,
  expires,
  canTrack
}) {
  try {
    if (!canTrack) {
      return;
    }

    const cookie = createCookieString({
      name,
      value,
      expires
    });
    document.cookie = cookie;
  } catch (err) {
    logger.warn("[COOKIE] SET error: ", (err == null ? void 0 : err.message) || err);
  }
});

export { getCookie, getCookieSync, setCookie }