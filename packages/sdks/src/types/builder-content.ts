import type { BuilderBlock } from './builder-block.js';
import type { Input } from './input.js';
import type { Nullable } from './typescript.js';

export interface Breakpoints {
  small: number;
  medium: number;
}

type BuilderContentVariationData<Name extends string> = Name extends 'foo'
  ? { bar: boolean }
  : Name extends 'bar'
    ? { abc: string }
    : Record<string, never>;

export interface BuilderContentVariation<Name extends string = string> {
  data?: BuilderContentVariationData<Name> & {
    title?: string;
    blocks?: BuilderBlock[];
    inputs?: Input[];
    state?: { [key: string]: any };
    jsCode?: string;
    tsCode?: string;
    httpRequests?: { [key: string]: string };
    [key: string]: any;
  };
  name?: Name;
  testRatio?: number;
  id?: string;
  meta?: {
    breakpoints?: Nullable<Breakpoints>;
    [key: string]: any;
  };
}

// TODO: separate full and partial versions
export interface BuilderContent extends BuilderContentVariation {
  // TODO: query
  '@version'?: number;
  published?: 'published' | 'draft' | 'archived';
  modelId?: string;
  priority?: number;
  firstPublished?: number;
  lastUpdated?: number;
  startDate?: number;
  endDate?: number;
  variations?: {
    [id: string]: BuilderContentVariation;
  };
  testVariationId?: string;
  testVariationName?: string;
}
