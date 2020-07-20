import { merge } from 'lodash';
import { ShopifyProduct } from '../interfaces/shopify-product';
import { BuilderElement } from '@builder.io/sdk';

export const defaultStyles = () => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  position: 'relative',
  flexShrink: '0',
  boxSizing: 'border-box',
  textAlign: 'center',
  marginTop: '15px',
});

function getParamNames(func: Function) {
  const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
  const ARGUMENT_NAMES = /([^\s,]+)/g;
  const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if (result === null) result = [];
  return result;
}

// Simple token to precompile the source code to strinsg
// TODO: generate both tsCode and jsCode
export const _s = (fn: (...args: any[]) => any) =>
  'console.error("This function was unprocessed by the TS transformer!")';

const getFnBody = (fn: Function) =>
  fn
    .toString()
    .replace(/^\W*(function[^{]+\{([\s\S]*)\}|[^=]+=>[^{]*\{([\s\S]*)\}|[^=]+=>(.+))/i, '$2$3$4');

// TODO: extract out args and assign the minified names to the original names
export const fnString = (fn: (...args: any[]) => any, jsCodeStyle = false) => {
  const params = getParamNames(fn);
  const body = getFnBody(fn);

  const list = jsCodeStyle
    ? ['data', 'ref', 'state', 'update', 'element', 'Builder', 'builder', 'context']
    : ['state', 'event', 'block', 'builder', 'Device', 'update', 'Builder', 'context'];

  const hasMinifiedParamNames = params && params[0] && params[0] !== list[0];
  if (!hasMinifiedParamNames) {
    return body;
  }
  let assignsStr = '';

  list.forEach((item, index) => {
    const param = params[index];
    if (param) {
      assignsStr += `var ${param} = ${item};\n`;
    }
  });
  return assignsStr + body;
};

export interface ShopifyProductState {
  productInfo?: ShopifyProduct & {
    price?: string;
  };
  selectedProductVariant?: number;
}

// TODO: why DeepPartial not work here?
export type JsElement = Partial<BuilderElement> & {
  layerLocked?: boolean;
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

export const mergeEl = (...args: JsElement[]) => merge({}, ...args.map(item => el(item)));

export const el = (info: JsElement, withParentMeta = false) =>
  merge(
    {} as BuilderElement,
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: { large: defaultStyles() },
      meta: {
        ...(withParentMeta && {
          requiresParent: {
            message: 'This block must be inside a "Product box" block',
            query: {
              'meta.kind': 'ProductBox',
            },
          },
        }),
      },
    } as BuilderElement,
    info
  );
