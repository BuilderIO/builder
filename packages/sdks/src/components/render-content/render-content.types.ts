import {
  BuilderRenderContext,
  RegisteredComponent,
  BuilderRenderState,
} from '../../context/types';
import { BuilderContent } from '../../types/builder-content';
import { Nullable } from '../../types/typescript';

export type RenderContentProps = {
  content?: Nullable<BuilderContent>;
  model?: string;
  data?: { [key: string]: any };
  context?: BuilderRenderContext;
  apiKey: string;
  customComponents?: RegisteredComponent[];
  canTrack?: boolean;
  locale?: string;
  includeRefs?: boolean;
};

export interface BuilderComponentStateChange {
  state: BuilderRenderState;
  ref: {
    name?: string;
    props?: {
      builderBlock?: {
        id?: string;
      };
    };
  };
}
