import * as fs from 'fs-extra-promise';
import { join } from 'path';

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
