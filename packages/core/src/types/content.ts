import { Input } from '@builder.io/sdk';
import { BuilderElement } from "./element";

export interface BuilderContentVariation {
  data?: {
    blocks?: BuilderElement[]
    inputs?: Input[]
    [key: string]: any
  }
  name?: string
  testRatio?: number
}

// TODO: typedoc this
export interface BuilderContent extends BuilderContentVariation {
  // TODO: query
  '@version'?: number
  name: string
  published: 'published' | 'draft' | 'archived'
  modelId: string
  priority?: number
  lastUpdated?: number
  startDate?: number
  endDate?: number
  variations?: {
    [id: string]: BuilderContentVariation | undefined
  }
}
