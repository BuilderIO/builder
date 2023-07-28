import type {
  BuilderRenderState,
  BuilderRenderContext,
  BuilderContextInterface,
} from '../../context/types';
export type ExecutorArgs = Pick<
  BuilderContextInterface,
  'localState' | 'context' | 'rootState' | 'rootSetState'
> & {
  useCode: string;
  builder: {
    isEditing: boolean | undefined;
    isBrowser: boolean | undefined;
    isServer: boolean | undefined;
  };
  state: BuilderRenderState;
  event: Event | undefined;
};
