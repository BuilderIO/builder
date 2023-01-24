import type { BuilderBlock } from './builder-block.js';
import type { Input } from './components.js';
import type { Nullable } from './typescript.js';

export interface Breakpoints {
  small: number;
  medium: number;
}
export interface BuilderContentVariation {
  data?: {
    title?: string;
    blocks?: BuilderBlock[];
    inputs?: Input[];
    state?: { [key: string]: any };
    jsCode?: string;
    tsCode?: string;
    httpRequests?: { [key: string]: string };
    [key: string]: any;
  };
  name?: string;
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
  id?: string;
  name?: string;
  published?: 'published' | 'draft' | 'archived';
  modelId?: string;
  priority?: number;
  lastUpdated?: number;
  startDate?: number;
  endDate?: number;
  variations?: {
    [id: string]: BuilderContentVariation | undefined;
  };
  testVariationId?: string;
  testVariationName?: string;
}
