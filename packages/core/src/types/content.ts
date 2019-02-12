import { Input } from '@builder.io/sdk';
import { BuilderElement } from "./element";

// TODO: typedoc this
export interface BuilderContent {
  name: string
  published: 'published' | 'draft' | 'archived'
  modelId: string
  priority?: number
  lastUpdated?: number
  data?: {
    blocks?: BuilderElement[]
    inputs?: Input[]
    [key: string]: any
  }
}
