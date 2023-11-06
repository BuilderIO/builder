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

import { getBlockProperties } from "../../../../functions/get-block-properties.js";

const getWrapperProps = ({
  componentOptions,
  builderBlock,
  context,
  componentRef,
  includeBlockProps,
  isInteractive,
  contextValue
}) => {
  const interactiveElementProps = {
    Wrapper: componentRef,
    block: builderBlock,
    context,
    wrapperProps: componentOptions
  };
  return isInteractive ? interactiveElementProps : __spreadValues(__spreadValues({}, componentOptions), includeBlockProps ? {
    attributes: getBlockProperties({
      block: builderBlock,
      context: contextValue
    })
  } : {});
};

export { getWrapperProps }