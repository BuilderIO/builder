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
const applyPatchWithMinimalMutationChain = (obj, patch, preserveRoot = false) => {
  if (Object(obj) !== obj) {
    return obj;
  }
  const {
    path,
    op,
    value
  } = patch;
  const pathArr = path.split(/\//);
  if (pathArr[0] === "") {
    pathArr.shift();
  }
  const newObj = preserveRoot ? obj : __spreadValues({}, obj);
  let objPart = newObj;
  for (let i = 0; i < pathArr.length; i++) {
    const isLast = i === pathArr.length - 1;
    const property = pathArr[i];
    if (isLast) {
      if (op === "replace") {
        objPart[property] = value;
      } else if (op === "add") {
        const index = Number(property);
        if (Array.isArray(objPart)) {
          if (property === "-") {
            objPart.push(value);
          } else {
            objPart.splice(index, 0, value);
          }
        } else {
          objPart[property] = value;
        }
      } else if (op === "remove") {
        const index = Number(property);
        if (Array.isArray(objPart)) {
          objPart.splice(index, 1);
        } else {
          delete objPart[property];
        }
      }
    } else {
      const nextProperty = pathArr[i + 1];
      const newPart = Object(objPart[property]) === objPart[property] ? objPart[property] : String(Number(nextProperty)) === nextProperty ? [] : {};
      objPart = objPart[property] = Array.isArray(newPart) ? [...newPart] : __spreadValues({}, newPart);
    }
  }
  return newObj;
};
export { applyPatchWithMinimalMutationChain }