import * as fs from 'fs-extra-promise';
import { join } from 'path';
import { merge } from 'lodash';
import { BuilderElement } from '@builder.io/sdk';
import Shopify from '../../js/index';

// TODO: helpers for this
export const LOG_BY_DEFAULT = false;
export const LOG = process.env.LOG ? process.env.LOG === 'true' : LOG_BY_DEFAULT;

export const OUTPUT_FILE_BY_DEFAULT = true;
export const OUTPUT_FILE = process.env.OUTPUT_FILE
  ? process.env.OUTPUT_FILE === 'true'
  : OUTPUT_FILE_BY_DEFAULT;

const outputRoot = './test/dist';

export const debugLog = (...args: any[]) => {
  if (LOG) {
    console.log(...args);
  }
};

export const debugFile = async (path: string, contents: string) => {
  if (OUTPUT_FILE) {
    fs.outputFileAsync(join(outputRoot, path), contents);
  }
};

export const el = (options?: Partial<BuilderElement>): BuilderElement => ({
  '@type': '@builder.io/sdk:Element',
  id: 'builder-' + Math.random().toString().split('.')[1],
  ...options,
});

export const text = (text: string, options?: Partial<BuilderElement>) =>
  el(
    merge(
      {
        component: {
          name: 'Text',
          options: {
            text,
          },
        },
      },
      options
    )
  );

export const mockState = (state: any = {}, context: any = {}, content = {}) => ({
  state,
  context,
  content,
  rootState: state,
  update: (fn: Function) => fn(state),
});

export const mockStateWithShopify = (state: any = {}, context: any = {}, content: any = {}) => {
  if (!context.shopify) {
    context.shopify = new Shopify(state);
  }
  return mockState(state, context, content);
};

export const builderComponentIdRegex = /builder-\d{8,20}/g;
