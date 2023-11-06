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
import { handleABTesting } from "../../helpers/ab-tests.js";
import { getDefaultCanTrack } from "../../helpers/canTrack.js";
import { logger } from "../../helpers/logger.js";
import { getPreviewContent } from "../../helpers/preview-lru-cache/get.js";
import { fetch } from "../get-fetch.js";
import { isBrowser } from "../is-browser.js";
import { generateContentUrl } from "./generate-content-url.js";

const checkContentHasResults = content => "results" in content;

function fetchOneEntry(options) {
  return __async(this, null, function* () {
    const allContent = yield fetchEntries(__spreadProps(__spreadValues({}, options), {
      limit: 1
    }));

    if (allContent) {
      return allContent.results[0] || null;
    }

    return null;
  });
}

const getContent = fetchOneEntry;

const _fetchContent = options => __async(void 0, null, function* () {
  const url = generateContentUrl(options);
  const res = yield fetch(url.href);
  const content = yield res.json();
  return content;
});

const _processContentResult = (_0, _1, ..._2) => __async(void 0, [_0, _1, ..._2], function* (options, content, url = generateContentUrl(options)) {
  const canTrack = getDefaultCanTrack(options.canTrack);
  const isPreviewing = url.search.includes(`preview=`);

  if (TARGET === "rsc" && isPreviewing) {
    const newResults = [];

    for (const item of content.results) {
      const previewContent = getPreviewContent(url.searchParams);
      newResults.push(previewContent || item);
    }

    content.results = newResults;
  }

  if (!canTrack) return content;
  if (!(isBrowser() || TARGET === "reactNative")) return content;

  try {
    const newResults = [];

    for (const item of content.results) {
      newResults.push(yield handleABTesting({
        item,
        canTrack
      }));
    }

    content.results = newResults;
  } catch (e) {
    logger.error("Could not process A/B tests. ", e);
  }

  return content;
});

function fetchEntries(options) {
  return __async(this, null, function* () {
    try {
      const url = generateContentUrl(options);
      const content = yield _fetchContent(options);

      if (!checkContentHasResults(content)) {
        logger.error("Error fetching data. ", {
          url,
          content,
          options
        });
        return null;
      }

      return _processContentResult(options, content);
    } catch (error) {
      logger.error("Error fetching data. ", error);
      return null;
    }
  });
}

const getAllContent = fetchEntries;
export { _processContentResult, fetchEntries, fetchOneEntry, getAllContent, getContent }