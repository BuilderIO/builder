import type {
  BuilderRenderState,
  BuilderRenderContext,
} from '../../context/types';

export type ExecutorArgs = {
  useCode: string;
  builder: {
    isEditing: boolean | undefined;
    isBrowser: boolean | undefined;
    isServer: boolean | undefined;
  };
  state: BuilderRenderState;
  context: BuilderRenderContext;
  event: Event | undefined;
};
