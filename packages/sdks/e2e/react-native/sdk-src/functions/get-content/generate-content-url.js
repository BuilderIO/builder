var __defProp = Object.defineProperty;
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
import { flatten } from "../../helpers/flatten.js";
import { DEFAULT_API_VERSION } from "../../types/api-version.js";
import { getBuilderSearchParamsFromWindow, normalizeSearchParams } from "../get-builder-search-params/index.js";
const isPositiveNumber = thing => typeof thing === "number" && !isNaN(thing) && thing >= 0;
const generateContentUrl = options => {
  let {
    noTraverse = false
  } = options;
  const {
    limit = 30,
    userAttributes,
    query,
    model,
    apiKey,
    includeRefs = true,
    enrich,
    locale,
    apiVersion = DEFAULT_API_VERSION,
    fields,
    omit,
    offset,
    cacheSeconds,
    staleCacheSeconds,
    sort,
    includeUnpublished
  } = options;
  if (!apiKey) {
    throw new Error("Missing API key");
  }
  if (!["v2", "v3"].includes(apiVersion)) {
    throw new Error(`Invalid apiVersion: expected 'v2' or 'v3', received '${apiVersion}'`);
  }
  if ((options.limit === void 0 || options.limit > 1) && !("noTraverse" in options)) {
    noTraverse = true;
  }
  const url = new URL(`https://cdn.builder.io/api/${apiVersion}/content/${model}?apiKey=${apiKey}&limit=${limit}&noTraverse=${noTraverse}&includeRefs=${includeRefs}${locale ? `&locale=${locale}` : ""}${enrich ? `&enrich=${enrich}` : ""}`);
  url.searchParams.set("omit", omit || "meta.componentsUsed");
  if (fields) {
    url.searchParams.set("fields", fields);
  }
  if (Number.isFinite(offset) && offset > -1) {
    url.searchParams.set("offset", String(Math.floor(offset)));
  }
  if (typeof includeUnpublished === "boolean") {
    url.searchParams.set("includeUnpublished", String(includeUnpublished));
  }
  if (cacheSeconds && isPositiveNumber(cacheSeconds)) {
    url.searchParams.set("cacheSeconds", String(cacheSeconds));
  }
  if (staleCacheSeconds && isPositiveNumber(staleCacheSeconds)) {
    url.searchParams.set("staleCacheSeconds", String(staleCacheSeconds));
  }
  if (sort) {
    const flattened2 = flatten({
      sort
    });
    for (const key in flattened2) {
      url.searchParams.set(key, JSON.stringify(flattened2[key]));
    }
  }
  const queryOptions = __spreadValues(__spreadValues({}, getBuilderSearchParamsFromWindow()), normalizeSearchParams(options.options || {}));
  const flattened = flatten(queryOptions);
  for (const key in flattened) {
    url.searchParams.set(key, String(flattened[key]));
  }
  if (userAttributes) {
    url.searchParams.set("userAttributes", JSON.stringify(userAttributes));
  }
  if (query) {
    const flattened2 = flatten({
      query
    });
    for (const key in flattened2) {
      url.searchParams.set(key, JSON.stringify(flattened2[key]));
    }
  }
  return url;
};
export { generateContentUrl }