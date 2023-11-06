var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;

var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;

var __spreadValues = (a, b) => {
  for (var prop in b || (b = {})) if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);

  if (__getOwnPropSymbols) for (var prop of __getOwnPropSymbols(b)) {
    if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
  }
  return a;
};

var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

var __objRest = (source, exclude) => {
  var target = {};

  for (var prop in source) if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0) target[prop] = source[prop];

  if (source != null && __getOwnPropSymbols) for (var prop of __getOwnPropSymbols(source)) {
    if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop)) target[prop] = source[prop];
  }
  return target;
};

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

import { TARGET } from "../../constants/target.js";
import { logger } from "../../helpers/logger.js";
import { getSessionId } from "../../helpers/sessionId.js";
import { getVisitorId } from "../../helpers/visitorId.js";
import { isBrowser } from "../is-browser.js";
import { isEditing } from "../is-editing.js";
import { getUserAttributes } from "./helpers.js";

const getTrackingEventData = _0 => __async(void 0, [_0], function* ({
  canTrack
}) {
  if (!canTrack) {
    return {
      visitorId: void 0,
      sessionId: void 0
    };
  }

  const sessionId = yield getSessionId({
    canTrack
  });
  const visitorId = getVisitorId({
    canTrack
  });
  return {
    sessionId,
    visitorId
  };
});

const createEvent = _a => __async(void 0, null, function* () {
  var _b = _a,
      {
    type: eventType,
    canTrack,
    apiKey,
    metadata
  } = _b,
      properties = __objRest(_b, ["type", "canTrack", "apiKey", "metadata"]);

  return {
    type: eventType,
    data: __spreadProps(__spreadValues(__spreadProps(__spreadValues({}, properties), {
      metadata: __spreadValues({
        url: location.href
      }, metadata)
    }), yield getTrackingEventData({
      canTrack
    })), {
      userAttributes: getUserAttributes(),
      ownerId: apiKey
    })
  };
});

function _track(eventProps) {
  return __async(this, null, function* () {
    if (!eventProps.apiKey) {
      logger.error("Missing API key for track call. Please provide your API key.");
      return;
    }

    if (!eventProps.canTrack) {
      return;
    }

    if (isEditing()) {
      return;
    }

    if (!(isBrowser() || TARGET === "reactNative")) {
      return;
    }

    return fetch(`https://cdn.builder.io/api/v1/track`, {
      method: "POST",
      body: JSON.stringify({
        events: [yield createEvent(eventProps)]
      }),
      headers: {
        "content-type": "application/json"
      },
      mode: "cors"
    }).catch(err => {
      console.error("Failed to track: ", err);
    });
  });
}

const track = args => _track(__spreadProps(__spreadValues({}, args), {
  canTrack: true
}));

export { _track, track }