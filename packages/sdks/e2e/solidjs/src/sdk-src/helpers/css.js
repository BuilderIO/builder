import { camelToKebabCase } from "../functions/camel-to-kebab-case.js";
import { checkIsDefined } from "./nullable.js";

const convertStyleMapToCSSArray = style => {
  const cssProps = Object.entries(style).map(([key, value]) => {
    if (typeof value === "string") {
      return `${camelToKebabCase(key)}: ${value};`;
    } else {
      return void 0;
    }
  });
  return cssProps.filter(checkIsDefined);
};

const convertStyleMapToCSS = style => convertStyleMapToCSSArray(style).join("\n");

const createCssClass = ({
  mediaQuery,
  className,
  styles
}) => {
  const cssClass = `.${className} {
    ${convertStyleMapToCSS(styles)}
  }`;

  if (mediaQuery) {
    return `${mediaQuery} {
      ${cssClass}
    }`;
  } else {
    return cssClass;
  }
};

export { convertStyleMapToCSS, convertStyleMapToCSSArray, createCssClass }