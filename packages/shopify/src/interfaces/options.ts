import { Options as PrettierOptions } from 'prettier';

export interface Options {
  emailMode?: boolean;
  extractCss?: boolean;
  minify?: boolean;
  convertShopifyBindings?: boolean;
  prettierOptions?: PrettierOptions;
}
