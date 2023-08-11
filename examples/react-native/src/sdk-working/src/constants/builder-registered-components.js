var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
import { default as Button } from "../blocks/button/button";
import { componentInfo as buttonComponentInfo } from "../blocks/button/component-info";
import { default as Columns } from "../blocks/columns/columns";
import { componentInfo as columnsComponentInfo } from "../blocks/columns/component-info";
import { componentInfo as fragmentComponentInfo } from "../blocks/fragment/component-info";
import { default as Fragment } from "../blocks/fragment/fragment";
import { componentInfo as imageComponentInfo } from "../blocks/image/component-info";
import { default as Image } from "../blocks/image/image";
import { componentInfo as sectionComponentInfo } from "../blocks/section/component-info";
import { default as Section } from "../blocks/section/section";
import { componentInfo as symbolComponentInfo } from "../blocks/symbol/component-info";
import { default as Symbol } from "../blocks/symbol/symbol";
import { componentInfo as textComponentInfo } from "../blocks/text/component-info";
import { default as Text } from "../blocks/text/text";
const getDefaultRegisteredComponents = () => [
  __spreadValues({ component: Columns }, columnsComponentInfo),
  __spreadValues({ component: Image }, imageComponentInfo),
  __spreadValues({ component: Text }, textComponentInfo),
  __spreadValues({ component: Symbol }, symbolComponentInfo),
  __spreadValues({ component: Button }, buttonComponentInfo),
  __spreadValues({ component: Section }, sectionComponentInfo),
  __spreadValues({ component: Fragment }, fragmentComponentInfo)
];
export {
  getDefaultRegisteredComponents
};
