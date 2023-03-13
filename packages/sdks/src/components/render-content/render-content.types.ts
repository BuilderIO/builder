import type {
  BuilderRenderContext,
  RegisteredComponent,
  BuilderRenderState,
} from '../../context/types';
import type { BuilderContent } from '../../types/builder-content';
import type { Nullable } from '../../types/typescript';
import type { ApiVersion } from '../../types/api-version';

export type RenderContentProps = {
  content?: Nullable<BuilderContent>;
  model?: string;
  data?: { [key: string]: any };
  context?: BuilderRenderContext;
  apiKey: string;
  apiVersion?: ApiVersion;
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
