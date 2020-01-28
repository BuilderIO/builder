import { Input } from '../builder.class';
import { BuilderElement } from './element';

export interface BuilderContentVariation {
  data?: {
    blocks?: BuilderElement[];
    inputs?: Input[];
    state?: { [key: string]: any };
    [key: string]: any;
  };
  name?: string;
  testRatio?: number;
  id?: string;
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
}
